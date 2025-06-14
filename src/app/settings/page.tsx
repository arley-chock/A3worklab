"use client";

import { Switch } from '@headlessui/react';
import { useState } from 'react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const settings = [
  {
    name: 'Notificações por Email',
    description: 'Receba notificações por email sobre suas reservas.',
    enabled: true,
  },
  {
    name: 'Confirmação Automática',
    description: 'Confirme automaticamente as reservas sem necessidade de aprovação.',
    enabled: false,
  },
  {
    name: 'Restrições de Horário',
    description: 'Permitir reservas apenas em horário comercial (8h às 18h).',
    enabled: true,
  },
  {
    name: 'Histórico de Uso',
    description: 'Manter histórico detalhado de uso dos recursos.',
    enabled: true,
  },
];

export default function SettingsPage() {
  const [enabledSettings, setEnabledSettings] = useState(
    settings.reduce((acc, setting) => {
      acc[setting.name] = setting.enabled;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleToggle = (name: string) => {
    setEnabledSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Configurações
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure as preferências do sistema e notificações.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="space-y-6">
              {settings.map((setting) => (
                <div
                  key={setting.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {setting.name}
                    </h3>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <Switch
                    checked={enabledSettings[setting.name]}
                    onChange={() => handleToggle(setting.name)}
                    className={classNames(
                      enabledSettings[setting.name]
                        ? 'bg-indigo-600'
                        : 'bg-gray-200',
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                    )}
                  >
                    <span className="sr-only">{setting.name}</span>
                    <span
                      className={classNames(
                        enabledSettings[setting.name]
                          ? 'translate-x-5'
                          : 'translate-x-0',
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                      )}
                    >
                      <span
                        className={classNames(
                          enabledSettings[setting.name]
                            ? 'opacity-0 duration-100 ease-out'
                            : 'opacity-100 duration-200 ease-in',
                          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                        )}
                        aria-hidden="true"
                      >
                        <svg
                          className="h-3 w-3 text-gray-400"
                          fill="none"
                          viewBox="0 0 12 12"
                        >
                          <path
                            d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span
                        className={classNames(
                          enabledSettings[setting.name]
                            ? 'opacity-100 duration-200 ease-in'
                            : 'opacity-0 duration-100 ease-out',
                          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                        )}
                        aria-hidden="true"
                      >
                        <svg
                          className="h-3 w-3 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 12 12"
                        >
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                        </svg>
                      </span>
                    </span>
                  </Switch>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 