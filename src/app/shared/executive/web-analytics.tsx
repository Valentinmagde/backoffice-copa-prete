// app/shared/executive/web-analytics.tsx
'use client';

import { Text } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import {
  ResponsiveContainer,
  CartesianGrid,
  YAxis,
  XAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { formatNumber } from '@core/utils/format-number';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { useMedia } from '@core/hooks/use-media';
import { useRegistrationTrend } from '@/lib/api/hooks/use-dashboard';
import { useState } from 'react';
import DropdownAction from '@core/components/charts/dropdown-action';

const optionsVue = [
  { value: 'registrations', label: 'Inscriptions' },
  { value: 'completed', label: 'Profil complété' },
  { value: 'submitted', label: 'Soumis' },
];

export default function WebAnalytics({ className }: { className?: string }) {
  const isSM = useMedia('(max-width: 640px)', false);
  const [cleDonnees, setCleDonnees] = useState('registrations');
  const { data: tendance, isLoading } = useRegistrationTrend();

  if (isLoading || !tendance) {
    return (
      <WidgetCard title="Évolution des inscriptions" className={className}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  // Filtrer les mois avec des données
  const donneesFiltrees = tendance.filter(item => item[cleDonnees as keyof typeof item] > 0);
  const total = donneesFiltrees.reduce((sum, item) => sum + (item[cleDonnees as keyof typeof item] as number), 0);

  const obtenirLabel = () => {
    switch (cleDonnees) {
      case 'registrations': return 'Inscriptions';
      case 'completed': return 'Profil complété';
      case 'submitted': return 'Soumis';
      default: return 'Inscriptions';
    }
  };

  return (
    <WidgetCard
      title="Évolution des inscriptions"
      titleClassName="font-medium sm:text-lg text-gray-800 mb-2.5 font-inter"
      className={className}
      action={
        <DropdownAction
          options={optionsVue}
          onChange={setCleDonnees}
          selectedValue={cleDonnees}
          dropdownClassName="!z-0"
        />
      }
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className="my-8 h-[300px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isSM && { minWidth: '500px' })}
          >
            <AreaChart
              data={donneesFiltrees}
              margin={{ left: -15 }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="gradientTendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={({ payload, ...rest }) => {
                  const pl = {
                    ...payload,
                    value: formatNumber(Number(payload.value)),
                  };
                  return <CustomYAxisTick payload={pl} {...rest} />;
                }}
              />
              <Tooltip content={<CustomTooltip formattedNumber />} />
              <Area
                type="monotone"
                dataKey={cleDonnees}
                stroke="#eab308"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientTendance)"
                name={obtenirLabel()}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-muted">
        <div className="flex items-center justify-between">
          <Text className="text-gray-600">Total {obtenirLabel().toLowerCase()}</Text>
          <Text className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</Text>
        </div>
      </div>
    </WidgetCard>
  );
}