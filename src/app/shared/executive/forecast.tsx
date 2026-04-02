'use client';

import { Title } from 'rizzui';
import cn from '@core/utils/class-names';
import WidgetCard from '@core/components/cards/widget-card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { useMedia } from '@core/hooks/use-media';
import DropdownAction from '@core/components/charts/dropdown-action';
import { useState } from 'react';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { formatNumber } from '@core/utils/format-number';
import { useRegistrationTrend } from '@/lib/api/hooks/use-dashboard';

const optionsVue = [
  { value: 'registrations', label: 'Inscriptions' },
  { value: 'completed', label: 'Profil complété' },
  { value: 'submitted', label: 'Soumis' },
];

export default function Forecast({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 800px)', false);
  const [cleDonnees, setCleDonnees] = useState('registrations');
  const { data: donneesTendance, isLoading } = useRegistrationTrend();

  if (isLoading || !donneesTendance) {
    return (
      <WidgetCard title="Évolution des inscriptions" className={className}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  // Filtrer les mois avec des données
  const donneesGraphique = donneesTendance.filter(item => item[cleDonnees as keyof typeof item] > 0);
  const valeurTotale = donneesGraphique.reduce((sum, item) => sum + (item[cleDonnees as keyof typeof item] as number), 0);

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
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      className={className}
      description={
        <Title as="h2" className="me-2 font-semibold">
          {valeurTotale.toLocaleString()} {obtenirLabel()}
        </Title>
      }
      action={
        <div className="flex items-center justify-between gap-5">
          <DropdownAction
            options={optionsVue}
            onChange={setCleDonnees}
            selectedValue={cleDonnees}
            dropdownClassName="!z-0"
          />
        </div>
      }
    >
      <div className='custom-scrollbar overflow-x-auto'>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <AreaChart
              data={donneesGraphique}
              margin={{
                left: -10,
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="cible" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={({ payload, ...rest }) => {
                  const pl = {
                    ...payload,
                    value: formatNumber(Number(payload.value)),
                  };
                  return (
                    <CustomYAxisTick payload={pl} {...rest} />
                  );
                }}
              />
              <Tooltip content={<CustomTooltip formattedNumber />} />
              <Area
                type="monotone"
                dataKey={cleDonnees}
                stroke="#eab308"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cible)"
                name={obtenirLabel()}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}