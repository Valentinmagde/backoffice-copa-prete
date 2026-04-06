'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ExportButton from '@/app/shared/export-button';
import { MPMEFilters } from '@/lib/api/types/mpme.types';
import { useMPMECandidatures } from '@/lib/api/hooks/use-mpme';
import MPMECandidaturesTable from '@/app/shared/mpme/candidatures/mpme-candidatures-table';
import { exportToCSV } from '@core/utils/export-to-csv-2';
import ExportColumnsSelector from '@core/components/export-columns-selector';

const pageHeader = {
  title: 'Candidatures MPME',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Candidatures MPME' },
  ],
};

const EXPORT_COLUMNS = [
  { key: 'applicationCode', label: 'Code' },
  { key: 'representativeName', label: 'Représentant' },
  { key: 'email', label: 'Email représentant' },
  { key: 'companyName', label: 'Entreprise' },
  { key: 'companyType', label: "Statut de l'entreprise" },
  { key: 'legalStatus', label: "Statut légal" },
  { key: 'sector', label: "Secteur d'activité" },
  { key: 'projectTitle', label: 'Titre du projet' },
  { key: 'requestedAmount', label: 'Subvention demandée' },
  { key: 'totalProjectCost', label: 'Coût total projet' },
  { key: 'province', label: 'Province' },
  { key: 'commune', label: 'Commune' },
  // { key: 'status', label: 'Statut' },
  { key: 'createdAt', label: "Date d'inscription" },
];

const DEFAULT_EXPORT_COLUMNS = [
  'applicationCode',
  'representativeName',
  'companyName',
  'projectTitle',
  'totalProjectCost',
  'province',
  'commune',
  'createdAt',
  'email',
  'companyType',
  'legalStatus',
  'sector',
  'requestedAmount',
  'status',
];

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
  const { data: data2} = useMPMECandidatures({page:   1, limit:  3000});
    
  const exportData = data2?.data || [];
  
  const candidatures = data?.data || [];
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const handleFilterChange = (newFilters: Partial<MPMEFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleExport = (selectedColumns: { key: string; label: string }[]) => {
    exportToCSV(exportData, selectedColumns, `candidatures_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <ExportColumnsSelector
            columns={EXPORT_COLUMNS}
            defaultSelected={DEFAULT_EXPORT_COLUMNS}
            onExport={handleExport}
            data={exportData}
            fileName={`candidatures_${new Date().toISOString().split('T')[0]}`}
          />
          {/* <ExportButton
            data={candidatures}
            fileName="mpme_candidatures"
            header="ID,Code,Entreprise,Province,Statut d'entreprise, Statut légal de l'entreprise,Représentant,Secteur d'activité,Titre du projet,Subvention demandée,Coût total projet,Statut,Date d'inscription"
          /> */}
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