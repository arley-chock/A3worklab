"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Usuários', href: '/users', icon: UsersIcon, adminOnly: true },
  { name: 'Recursos', href: '/resources', icon: BuildingOfficeIcon },
  { name: 'Reservas', href: '/reservations', icon: CalendarIcon },
  { name: 'Relatórios', href: '/reports', icon: ChartBarIcon },
  { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className="flex min-h-0 flex-col bg-gray-800">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <span className="text-xl font-bold text-white">WorkLab</span>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive
                      ? 'text-gray-300'
                      : 'text-gray-400 group-hover:text-gray-300',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 