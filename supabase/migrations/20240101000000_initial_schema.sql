-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE resource_type AS ENUM ('room', 'desk', 'laptop', 'projector');
CREATE TYPE reservation_status AS ENUM ('active', 'cancelled', 'completed');

-- Create tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type resource_type NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    location TEXT NOT NULL,
    restrictions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status reservation_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (ends_at > starts_at)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reservations_resource_id ON reservations(resource_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create GIST index for reservation time range
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE INDEX idx_reservations_time_range ON reservations USING gist (tsrange(starts_at, ends_at));

-- Create materialized view for usage reports
CREATE MATERIALIZED VIEW usage_reports AS
SELECT
    r.id as resource_id,
    r.name as resource_name,
    COUNT(res.id) as total_reservations,
    SUM(EXTRACT(EPOCH FROM (res.ends_at - res.starts_at))/3600) as total_hours,
    (COUNT(res.id) * 100.0 / NULLIF(EXTRACT(EPOCH FROM (NOW() - r.created_at))/3600, 0)) as utilization_rate,
    date_trunc('month', res.created_at) as period
FROM resources r
LEFT JOIN reservations res ON r.id = res.resource_id
WHERE res.status = 'active'
GROUP BY r.id, r.name, period;

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Resources policies
CREATE POLICY "Anyone can view resources"
    ON resources FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage resources"
    ON resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Reservations policies
CREATE POLICY "Users can view their own reservations"
    ON reservations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations"
    ON reservations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
    ON reservations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reservations"
    ON reservations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Audit logs policies
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to refresh usage reports
CREATE OR REPLACE FUNCTION refresh_usage_reports()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY usage_reports;
END;
$$ LANGUAGE plpgsql; 