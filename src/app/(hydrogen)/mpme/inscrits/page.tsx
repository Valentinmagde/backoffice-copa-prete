'use client';

import { useState, useEffect } from 'react';
import { useMPMEInscrits } from '@/lib/api/hooks/use-mpme';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ExportButton from '@/app/shared/export-button';
import { Button } from 'rizzui/button';
import { PiPlusBold } from 'react-icons/pi';
import Link from 'next/link';
import { mpmeInscritsColumns } from '@/app/shared/mpme/inscrits/columns';
import MPMEInscritsTable from '@/app/shared/mpme/inscrits/mpme-inscrits-table';
import { MPMEFilters } from '@/lib/api/types/mpme.types';

const pageHeader = {
  title: 'MPME Inscrits',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'MPME Inscrits' },
  ],
};

export default function MPMEInscritsPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState<Omit<MPMEFilters, 'page' | 'limit'>>({});

  const { data, isLoading } = useMPMEInscrits({
    page:   pagination.pageIndex + 1,
    limit:  pagination.pageSize,
    ...filters,
  });
  
  const beneficiaries = data?.data || [];
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const handleFilterChange = (newFilters: Partial<MPMEFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // ✅ reset page 1
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
            data={beneficiaries}
            fileName="mpme_inscrits"
            header="Code,Entreprise,Représentant,Email,Téléphone,Secteur,Province,Date d'inscription,Statut"
          />
          {/* <Link href={routes.mpme.inscrits.create} className="w-full @lg:w-auto">
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Ajouter un MPME
            </Button>
          </Link> */}
        </div>
      </PageHeader>

      <MPMEInscritsTable
        key={`page-${pagination.pageIndex}-${pagination.pageSize}`}
        data={beneficiaries}
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