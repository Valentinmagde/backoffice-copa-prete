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
  registrations: '#eab308', // Jaune pour les inscriptions
  completed: '#3b82f6',     // Bleu pour profils complets
  submitted: '#10b981',      // Vert pour soumis
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

  const donneesGraphique = donneesTendance;

  // Calculer les totaux
  const totalInscriptions = donneesGraphique.reduce((sum, item) => sum + (item.registrations || 0), 0);
  const totalProfilsComplets = donneesGraphique.reduce((sum, item) => sum + (item.completed || 0), 0);
  const totalSoumis = donneesGraphique.reduce((sum, item) => sum + (item.submitted || 0), 0);

  return (
    <WidgetCard
      title="Évolution des inscriptions et candidatures"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      className={className}
      description={
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COULEURS.registrations }} />
            <span className="text-sm text-gray-600">Inscriptions: <strong className="text-gray-900">{totalInscriptions.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COULEURS.completed }} />
            <span className="text-sm text-gray-600">Profils complets: <strong className="text-gray-900">{totalProfilsComplets.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COULEURS.submitted }} />
            <span className="text-sm text-gray-600">Soumis: <strong className="text-gray-900">{totalSoumis.toLocaleString()}</strong></span>
          </div>
        </div>
      }
      action={
        // <Select
        //   options={optionsPeriode}
        //   value={periode}
        //   onChange={(e) => setPeriode(e.value)}
        //   selectClassName="w-32"
        //   inPortal={false}
        // />
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
              // margin={{ left: -10 }}
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
              <Tooltip content={<CustomTooltip formattedNumber />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => {
                  const labels = {
                    registrations: 'Inscriptions',
                    completed: 'Profils complets',
                    submitted: 'Soumis'
                  };
                  return labels[value as keyof typeof labels] || value;
                }}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke={COULEURS.registrations}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientRegistrations)"
                name="registrations"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke={COULEURS.completed}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientCompleted)"
                name="completed"
              />
              <Area
                type="monotone"
                dataKey="submitted"
                stroke={COULEURS.submitted}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientSubmitted)"
                name="submitted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}