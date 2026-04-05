'use client';

import { Title, Select } from 'rizzui';
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
  Legend,
} from 'recharts';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { useMedia } from '@core/hooks/use-media';
import { useState } from 'react';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { formatNumber } from '@core/utils/format-number';
import { useRegistrationTrendByPeriod } from '@/lib/api/hooks/use-dashboard';
import DropdownAction from '@core/components/charts/dropdown-action';

const optionsPeriode = [
  { value: 'day', label: 'Par jour' },
  { value: 'week', label: 'Par semaine' },
  { value: 'month', label: 'Par mois' },
];

const COULEURS = {
  registrations: '#eab308',
  completed: '#3b82f6',
  submitted: '#10b981',
};

// Noms français pour les légendes et tooltips
const NOMS_FRANCAIS = {
  registrations: 'Inscriptions',
  completed: 'Profils complets',
  submitted: 'Soumis',
};

export default function Forecast({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 800px)', false);
  const [periode, setPeriode] = useState('month');
  const { data: donneesTendance, isLoading } = useRegistrationTrendByPeriod(periode);

  if (isLoading || !donneesTendance) {
    return (
      <WidgetCard title="Évolution des inscriptions et candidatures" className={className}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  // Transformer les données pour avoir les noms en français
  const donneesGraphique = donneesTendance.map(item => ({
    ...item,
    Inscriptions: item.registrations,
    'Profils complets': item.completed,
    Soumis: item.submitted,
  }));

  const totalInscriptions = donneesGraphique.reduce((sum, item) => sum + (item.Inscriptions || 0), 0);
  const totalProfilsComplets = donneesGraphique.reduce((sum, item) => sum + (item['Profils complets'] || 0), 0);
  const totalSoumis = donneesGraphique.reduce((sum, item) => sum + (item.Soumis || 0), 0);

  return (
    <WidgetCard
      title="Évolution des inscriptions et candidatures"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      className={className}
      description={
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COULEURS.registrations }} />
            <span className="text-sm text-gray-600">Inscriptions: <strong className="text-gray-900">{totalInscriptions.toLocaleString('fr-FR')}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COULEURS.completed }} />
            <span className="text-sm text-gray-600">Profils complets: <strong className="text-gray-900">{totalProfilsComplets.toLocaleString('fr-FR')}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COULEURS.submitted }} />
            <span className="text-sm text-gray-600">Soumis: <strong className="text-gray-900">{totalSoumis.toLocaleString('fr-FR')}</strong></span>
          </div>
        </div>
      }
      action={
        <div className="flex items-center justify-between gap-5">
          <Legend className="hidden @2xl:flex @3xl:hidden @5xl:flex" />
          <DropdownAction
            options={optionsPeriode}
            onChange={(e) => setPeriode(e)}
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
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="gradientRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COULEURS.registrations} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={COULEURS.registrations} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COULEURS.completed} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={COULEURS.completed} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COULEURS.submitted} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={COULEURS.submitted} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                angle={periode === 'day' ? -45 : 0}
                textAnchor={periode === 'day' ? 'end' : 'middle'}
                height={periode === 'day' ? 80 : 60}
                interval={periode === 'day' ? 6 : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tick={({ payload, ...rest }) => {
                  const pl = {
                    ...payload,
                    value: formatNumber(Number(payload.value)),
                  };
                  return <CustomYAxisTick payload={pl} {...rest} />;
                }}
              />
              <Tooltip 
                content={<CustomTooltip formattedNumber />}
                formatter={(value: number, name: string) => {
                  // Utiliser les noms français directement
                  return [value?.toLocaleString('fr-FR'), name];
                }}
                labelFormatter={(label) => label}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                height={36}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Area
                type="monotone"
                dataKey="Inscriptions"
                stroke={COULEURS.registrations}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientRegistrations)"
                name="Inscriptions"
              />
              <Area
                type="monotone"
                dataKey="Profils complets"
                stroke={COULEURS.completed}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientCompleted)"
                name="Profils complets"
              />
              <Area
                type="monotone"
                dataKey="Soumis"
                stroke={COULEURS.submitted}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientSubmitted)"
                name="Soumis"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}