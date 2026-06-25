'use client';

// app/shared/executive/index.tsx
import { useState } from 'react';
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
import DashboardFilters from './dashboard-filters';
import GeographicAnalysis from './geographic-analysis';
import SectorPerformance from './sector-performance';
import CandidateDistribution from './candidate-distribution';
import CompanyStatusAnalysis from './company-status-analysis';
import CohortSelect from '@/app/shared/cohorts/cohort-select';

export default function ExecutiveDashboard({
  className,
}: {
  className?: string;
}) {
  const [editionId, setEditionId] = useState<number | undefined>(undefined);

  return (
    <div
      className={cn(
        'flex flex-col gap-5 @container 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8',
        className
      )}
    >
      {/* Filtre cohorte */}
      <div className="flex justify-end">
        <CohortSelect value={editionId} onChange={setEditionId} />
      </div>

      {/* Filters */}
      {/* <DashboardFilters /> */}

      {/* Cartes KPI */}
      <StatsCards editionId={editionId} />

      {/* Ligne 1: Secteur et Région */}
      <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-2 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8">
        {/* <BiggestDeal /> */}
        <CompanyStatusAnalysis editionId={editionId} />
        <ActiveUsers editionId={editionId} />
      </div>

      {/* Analyse genre, statut d'entreprise et catégorie */}
      {/* <MRRReport /> */}

      {/* Ligne 2: Évolution et Pipeline */}
      <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-2 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8">
        {/* <WebAnalytics /> */}
        <MRRReport editionId={editionId} />
        <BiggestDeal editionId={editionId} />
      </div>

      <SocialFollowers editionId={editionId} />

      {/* Forecast */}
      <Forecast editionId={editionId} />

      {/* Analyse genre et catégorie */}
      {/* <MRRReport /> */}

      {/* Graphiques RevenueExpense et Forecast existants */}
      {/* <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-2 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8">
        <RevenueExpense />
      </div> */}

      {/* <GeographicAnalysis />

      <SectorPerformance />

      <CandidateDistribution />

      <TotalProfitLoss /> */}

      {/* Pipeline détaillé */}
      {/* <TotalProfitLoss /> */}

      {/* Tableau des dernières candidatures */}
      <RecentCustomers editionId={editionId} />
    </div>
  );
}