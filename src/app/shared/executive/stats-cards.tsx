'use client';

import MetricCard from '@core/components/cards/metric-card';
import TrendingDownIcon from '@core/components/icons/trending-down';
import TrendingUpIcon from '@core/components/icons/trending-up';
import { getChartColorByEngagementRate } from '@core/components/table-utils/get-chart-color-by-engagement-rate';
import cn from '@core/utils/class-names';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Text } from 'rizzui';
import { useDashboardStats } from '@/lib/api/hooks/use-dashboard';
import TagIcon3 from '@core/components/icons/tag-3';
import TagIcon2 from '@core/components/icons/tag-2';
import TagIcon from '@core/components/icons/tag';
import TicketIcon from '@core/components/icons/ticket';

interface StatsCardsProps {
  className?: string;
}

export default function StatsCards({ className }: StatsCardsProps) {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="custom-scrollbar overflow-x-auto">
        <div className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:col-span-2 @6xl:grid-cols-4 @7xl:col-span-12 3xl:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Fonction pour calculer le pourcentage en évitant les NaN
  const calculerPourcentage = (actuel: number, precedent: number): number => {
    if (!precedent || precedent === 0) return actuel > 0 ? 100 : 0;
    return ((actuel - precedent) / precedent) * 100;
  };

  // Fonction pour formater la valeur
  const formaterValeur = (valeur: number | undefined | null): string => {
    if (valeur === undefined || valeur === null || isNaN(valeur)) return '0';
    return valeur.toLocaleString();
  };

  const chartData = Array.from({ length: 20 }, (_, i) => ({
    label: (i + 1).toString(),
    count: Math.floor(Math.random() * 100),
  }));

  const totalMpme = stats.totalMpme || 0;
  const totalCandidatures = stats.totalCandidatures || 0;
  const totalBusinessPlans = stats.totalBusinessPlans || 0;
  const totalWomen = stats.totalWomen || 0;

  const previousTotalMpme = stats.previousPeriod?.totalMpme || 0;
  const previousTotalCandidatures = stats.previousPeriod?.totalCandidatures || 0;
  const previousTotalBusinessPlans = stats.previousPeriod?.totalBusinessPlans || 0;
  const previousTotalWomen = stats.previousPeriod?.totalWomen || 0;

  const ticketStats = [
    {
      id: 1,
      title: 'MPME inscrites',
      metric: formaterValeur(totalMpme),
      icon: <TicketIcon className="h-full w-full" />,
      fill: '#3872FA',
      percentage: calculerPourcentage(totalMpme, previousTotalMpme),
      increased: totalMpme >= previousTotalMpme,
      decreased: totalMpme < previousTotalMpme,
      value: calculerPourcentage(totalMpme, previousTotalMpme).toFixed(1),
      engagementRate: 70.03,
      chart: chartData,
    },
    {
      id: 2,
      title: 'Candidatures soumises',
      metric: formaterValeur(totalCandidatures),
      icon: <TagIcon className="h-full w-full" />,
      fill: '#3872FA',
      percentage: calculerPourcentage(totalCandidatures, previousTotalCandidatures),
      increased: totalCandidatures >= previousTotalCandidatures,
      decreased: totalCandidatures < previousTotalCandidatures,
      value: calculerPourcentage(totalCandidatures, previousTotalCandidatures).toFixed(1),
      engagementRate: 53.95,
      chart: chartData,
    },
    {
      id: 3,
      title: 'Plans d\'affaires soumis',
      metric: formaterValeur(totalBusinessPlans),
      icon: <TagIcon2 className="h-full w-full" />,
      fill: '#3872FA',
      percentage: calculerPourcentage(totalBusinessPlans, previousTotalBusinessPlans),
      increased: totalBusinessPlans >= previousTotalBusinessPlans,
      decreased: totalBusinessPlans < previousTotalBusinessPlans,
      value: calculerPourcentage(totalBusinessPlans, previousTotalBusinessPlans).toFixed(1),
      engagementRate: 67.92,
      chart: chartData,
    },
    {
      id: 4,
      title: 'Femmes entrepreneures',
      metric: formaterValeur(totalWomen),
      icon: <TagIcon3 className="h-full w-full" />,
      fill: '#3872FA',
      percentage: calculerPourcentage(totalWomen, previousTotalWomen),
      increased: totalWomen >= previousTotalWomen,
      decreased: totalWomen < previousTotalWomen,
      value: calculerPourcentage(totalWomen, previousTotalWomen).toFixed(1),
      engagementRate: 70.03,
      chart: chartData,
    },
  ];

  // const ticketStats = [
  //   {
  //     id: 1,
  //     icon: <TicketIcon className="h-full w-full" />,
  //     title: 'Total Number of Tickets',
  //     metric: '12,450',
  //   },
  //   {
  //     id: 2,
  //     icon: <TagIcon className="h-full w-full" />,
  //     title: 'Unassigned Tickets',
  //     metric: '3,590',
  //   },
  //   {
  //     id: 3,
  //     icon: <TagIcon2 className="h-full w-full" />,
  //     title: 'Open Tickets',
  //     metric: '7,890',
  //   },
  //   {
  //     id: 3,
  //     icon: <TagIcon3 className="h-full w-full" />,
  //     title: 'Solved Tickets',
  //     metric: '1,160',
  //   },
  // ];

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <div
        className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:col-span-2 @6xl:grid-cols-4 @7xl:col-span-12 3xl:gap-8"
      >
        {ticketStats.map((stat) => (
          <MetricCard
            key={stat.title + stat.id}
            title={stat.title}
            metric={stat.metric}
            icon={stat.icon}
            iconClassName="bg-transparent w-11 h-11"
          />
        ))}
      </div>
    </div>
  );

  // return (
  //   <div className="custom-scrollbar overflow-x-auto">
  //     <div className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:col-span-2 @6xl:grid-cols-4 @7xl:col-span-12 3xl:gap-8">
  //       {filesStatData.map((stat: any) => {
  //         const variationValue = parseFloat(stat.value);
  //         const isValidVariation = !isNaN(variationValue);

  //         return (
  //           <MetricCard
  //             key={stat.id}
  //             title={stat.title}
  //             metric={stat.metric}
  //             chartClassName="w-44"
  //             metricClassName="3xl:text-[22px]"
  //             className={cn('w-full max-w-full justify-between', className)}
  //             chart={
  //               <div className="ms-auto h-12 w-full 4xl:h-9">
  //                 <ResponsiveContainer width="100%" height="100%">
  //                   <AreaChart
  //                     data={stat.chart}
  //                     margin={{
  //                       left: -30,
  //                     }}
  //                   >
  //                     <defs>
  //                       <linearGradient
  //                         id={`deviceSessionsMobile-${stat.id}`}
  //                         x1="0"
  //                         y1="0"
  //                         x2="0"
  //                         y2="1"
  //                       >
  //                         <stop
  //                           offset="5%"
  //                           stopColor="#F0F1FF"
  //                           className="[stop-opacity:0.25] dark:[stop-opacity:0.2]"
  //                         />
  //                         <stop
  //                           offset="95%"
  //                           stopColor={getChartColorByEngagementRate(
  //                             stat.engagementRate
  //                           )}
  //                           stopOpacity={0}
  //                         />
  //                       </linearGradient>
  //                     </defs>
  //                     <Area
  //                       type="bump"
  //                       dataKey="count"
  //                       stroke={getChartColorByEngagementRate(
  //                         stat.engagementRate
  //                       )}
  //                       strokeWidth={1.8}
  //                       fillOpacity={1}
  //                       fill={`url(#deviceSessionsMobile-${stat.id})`}
  //                     />
  //                   </AreaChart>
  //                 </ResponsiveContainer>
  //               </div>
  //             }
  //           >
  //             <Text className="mt-5 flex items-center leading-none text-gray-500">
  //               {isValidVariation && (
  //                 <>
  //                   <Text
  //                     as="span"
  //                     className={cn(
  //                       'me-2 inline-flex items-center font-medium',
  //                       stat.increased ? 'text-green' : 'text-red'
  //                     )}
  //                   >
  //                     {stat.increased ? (
  //                       <TrendingUpIcon className="me-1 h-4 w-4" />
  //                     ) : (
  //                       <TrendingDownIcon className="me-1 h-4 w-4" />
  //                     )}
  //                     {Math.abs(variationValue).toFixed(1)}%
  //                   </Text>
  //                   {stat.increased ? 'Augmentation' : 'Diminution'} le mois dernier
  //                 </>
  //               )}
  //               {!isValidVariation && (
  //                 <span className="text-gray-400">Aucune donnée disponible</span>
  //               )}
  //             </Text>
  //           </MetricCard>
  //         );
  //       })}
  //     </div>
  //   </div>
  // );
}
