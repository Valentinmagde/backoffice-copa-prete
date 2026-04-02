'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ExportButton from '@/app/shared/export-button';
import { MPMEFilters } from '@/lib/api/types/mpme.types';
import { useMPMECandidatures } from '@/lib/api/hooks/use-mpme';
import MPMECandidaturesTable from '@/app/shared/mpme/candidatures/mpme-candidatures-table';

const pageHeader = {
  title: 'Candidatures MPME',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Candidatures MPME' },
  ],
};

export default function MPMECandidaturesPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState<Omit<MPMEFilters, 'page' | 'limit'>>({ isProfileComplete: true });

  const { data, isLoading } = useMPMECandidatures({
    page:   pagination.pageIndex + 1,
    limit:  pagination.pageSize,
    ...filters,
  });
  
  const candidatures = data?.data || [];
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  console.log(candidatures);

  const handleFilterChange = (newFilters: Partial<MPMEFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <ExportButton
            data={candidatures}
            fileName="mpme_candidatures"
            header="Code,Entreprise,Représentant,Projet,Secteur,Montant,Date de soumission,Statut"
          />
        </div>
      </PageHeader>

      <MPMECandidaturesTable
        key={`page-${pagination.pageIndex}-${pagination.pageSize}`}
        data={candidatures}
        isLoading={isLoading}
        totalItems={totalItems}
        totalPages={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        // columns={mpmeInscritsColumns}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
    </>
  );
}