// app/shared/executive/index.tsx
import cn from '@core/utils/class-names';
import StatsCards from '@/app/shared/executive/stats-cards';
import RevenueExpense from '@/app/shared/executive/revenue-expense';
import Forecast from '@/app/shared/executive/forecast';
import ActiveUsers from '@/app/shared/executive/active-users';
import MRRReport from '@/app/shared/executive/mrr-report';
import SocialFollowers from '@/app/shared/executive/social-followers';
import WebAnalytics from '@/app/shared/executive/web-analytics';
import BiggestDeal from '@/app/shared/executive/biggest-deal';
import RecentCustomers from '@/app/shared/executive/recent-customers';
import TotalProfitLoss from '@/app/shared/executive/total-profit-loss';

export default function ExecutiveDashboard({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 @container 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8',
        className
      )}
    >
      {/* Cartes KPI */}
      <StatsCards />

      {/* Ligne 1: Secteur et Région */}
      <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-2 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8">
        <SocialFollowers />
        <ActiveUsers />
      </div>

      {/* Ligne 2: Évolution et Pipeline */}
      <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-2 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8">
        {/* <WebAnalytics /> */}
        <MRRReport />
        <BiggestDeal />
      </div>

      {/* Analyse genre et catégorie */}
      {/* <MRRReport /> */}

      {/* Graphiques RevenueExpense et Forecast existants */}
      {/* <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-2 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8">
        <RevenueExpense />
        <Forecast />
      </div> */}

      {/* Pipeline détaillé */}
      {/* <TotalProfitLoss /> */}

      {/* Tableau des dernières candidatures */}
      {/* <RecentCustomers /> */}
    </div>
  );
}