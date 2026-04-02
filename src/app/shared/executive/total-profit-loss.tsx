'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import { formatNumber } from '@core/utils/format-number';
import { useStatusPipeline } from '@/lib/api/hooks/use-dashboard';

export default function TotalProfitLoss({ className }: { className?: string }) {
  const { data: donneesPipeline, isLoading } = useStatusPipeline();

  if (isLoading || !donneesPipeline) {
    return (
      <WidgetCard title="Pipeline par statut" className={cn('min-h-[28rem]', className)}>
        <div className="h-[28rem] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  const donneesGraphique = donneesPipeline.map(item => ({
    label: item.statut,
    count: item.nombre,
    pourcentage: item.pourcentage,
  }));

  const total = donneesGraphique.reduce((sum, item) => sum + item.count, 0);

  return (
    <WidgetCard
      title="Pipeline par statut"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      className={cn('min-h-[28rem]', className)}
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2 font-semibold">
            {total.toLocaleString()} candidatures
          </Title>
          <Text className="flex items-center leading-none text-gray-500">
            <Text
              as="span"
              className={cn(
                'me-2 inline-flex items-center font-medium text-green'
              )}
            >
              <TrendingUpIcon className="me-1 h-4 w-4" />
              total
            </Text>
          </Text>
        </div>
      }
    >
      <div className="custom-scrollbar overflow-x-auto -mb-3 pb-3">
        <div className="h-[28rem] w-full pt-6 @lg:pt-8">
          <ResponsiveContainer width="100%" height="100%" minWidth={500}>
            <ComposedChart
              data={donneesGraphique}
              margin={{ left: 5 }}
              barGap={0}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <CartesianGrid
                vertical={false}
                strokeOpacity={0.435}
                strokeDasharray="8 10"
              />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
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
                dataKey="count"
                fill="#2563eb"
                barSize={40}
                radius={[4, 4, 0, 0]}
                name="Candidatures"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}