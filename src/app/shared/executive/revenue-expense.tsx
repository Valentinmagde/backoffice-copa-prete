'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { useMedia } from '@core/hooks/use-media';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import DropdownAction from '@core/components/charts/dropdown-action';
import { formatNumber } from '@core/utils/format-number';
import { useCandidatesBySector } from '@/lib/api/hooks/use-dashboard';

const optionsVue = [
  { value: 'Total', label: 'Total' },
  { value: 'Women', label: 'Femmes' },
  { value: 'Men', label: 'Hommes' },
];

export default function RevenueExpense({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 820px)', false);
  const [typeVue, setTypeVue] = useState('Total');
  const { data: donneesSecteur, isLoading } = useCandidatesBySector();

  if (isLoading || !donneesSecteur) {
    return (
      <WidgetCard title="Candidatures par secteur" className={className}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  // Transformer les données pour le graphique
  const donneesGraphique = donneesSecteur.map(item => ({
    key: item.secteur === 'Non spécifié' ? 'Non spécifié' : item.secteur,
    total: item.total,
    femmes: item.femmes,
    hommes: item.hommes,
  }));

  const valeurTotale = donneesGraphique.reduce((sum, item) => sum + (item[typeVue.toLowerCase() as keyof typeof item] as number), 0);

  const obtenirLabel = () => {
    switch (typeVue) {
      case 'Total': return 'Total';
      case 'Women': return 'Femmes';
      case 'Men': return 'Hommes';
      default: return 'Total';
    }
  };

  return (
    <WidgetCard
      title="Candidatures par secteur"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2 font-semibold">
            {valeurTotale.toLocaleString()}
          </Title>
          <Text className="flex items-center leading-none text-gray-500">
            <Text
              as="span"
              className={cn(
                'me-2 inline-flex items-center font-medium text-green'
              )}
            >
              <TrendingUpIcon className="me-1 h-4 w-4" />
              {obtenirLabel()}
            </Text>
          </Text>
        </div>
      }
      action={
        <div className="flex items-center justify-between gap-5">
          <DropdownAction
            options={optionsVue}
            onChange={setTypeVue}
            selectedValue={typeVue}
          />
        </div>
      }
      className={className}
    >
      <div className="custom-scrollbar overflow-x-auto">
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <ComposedChart
              data={donneesGraphique}
              barSize={isTablet ? 20 : 24}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient
                  id="colorRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#A5BDEC" />
                  <stop offset="0.8" stopColor="#477DFF" />
                  <stop offset="1" stopColor="#477DFF" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis dataKey="key" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
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
              <Bar
                dataKey={typeVue.toLowerCase()}
                barSize={40}
                fill="url(#colorRevenue)"
                stroke="#477DFF"
                strokeOpacity={0.3}
                radius={[4, 4, 0, 0]}
                name={obtenirLabel()}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}