export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
};

export type Resource = {
  id: string;
  name: string;
  description: string;
  type: 'room' | 'station' | 'notebook' | 'projector' | 'other';
  capacity?: number;
  location: string;
  restrictions?: ResourceRestrictions;
  createdAt: Date;
  updatedAt: Date;
};

export type ResourceRestrictions = {
  minAdvanceNotice: number; // em minutos
  maxDuration: number; // em minutos
  allowedStartTime: string; // formato HH:mm
  allowedEndTime: string; // formato HH:mm
  allowedDays: number[]; // 0-6 (Domingo-Sábado)
  allowedRoles: string[];
};

export type Reservation = {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'user' | 'resource' | 'reservation';
  entityId: string;
  details: Record<string, any>;
  createdAt: Date;
}; 