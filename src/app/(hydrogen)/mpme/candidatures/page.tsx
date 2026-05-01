'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { MPMEFilters } from '@/lib/api/types/mpme.types';
import { useMPMECandidatures } from '@/lib/api/hooks/use-mpme';
import MPMECandidaturesTable from '@/app/shared/mpme/candidatures/mpme-candidatures-table';
import { exportToCSV } from '@core/utils/export-to-csv-2';
import ExportColumnsSelector from '@core/components/export-columns-selector';
import { debounce } from 'lodash';

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
];

// Fonction pour parser les paramètres d'URL
export const parseUrlParams = (searchParams: URLSearchParams): {
  pagination: { pageIndex: number; pageSize: number };
  filters: Omit<MPMEFilters, 'page' | 'limit'>;
} => {
  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Filtres texte/recherche
  const search = searchParams.get('search') || '';

  // Filtres simples (string)
  const statusId = searchParams.get('statusId') || undefined;
  const category = searchParams.get('category') || undefined;
  const companyType = searchParams.get('companyType') || undefined;
  const gender = searchParams.get('gender') || undefined;
  const legalStatus = searchParams.get('legalStatus') || undefined;
  const sector = searchParams.get('sector') || undefined;
  const amountRange = searchParams.get('amountRange') || undefined;
  const minCompletion = searchParams.get('minCompletion') || undefined;

  // Filtres numériques
  const provinceId = searchParams.get('provinceId') ? parseInt(searchParams.get('provinceId')!) : undefined;
  const minAmount = searchParams.get('minAmount') ? parseInt(searchParams.get('minAmount')!) : undefined;
  const maxAmount = searchParams.get('maxAmount') ? parseInt(searchParams.get('maxAmount')!) : undefined;

  // Filtres booléens
  const parseBool = (v: string | null) => v === 'true' ? true : v === 'false' ? false : undefined;
  const isWomanLed      = parseBool(searchParams.get('isWomanLed'));
  const isRefugeeLed    = parseBool(searchParams.get('isRefugeeLed'));
  const hasClimateImpact = parseBool(searchParams.get('hasClimateImpact'));
  const documentsCorrected = parseBool(searchParams.get('documentsCorrected'));

  // Filtres de dates
  const fromDate = searchParams.get('fromDate') || undefined;
  const toDate = searchParams.get('toDate') || undefined;

  return {
    pagination: {
      pageIndex: page - 1,
      pageSize: limit
    },
    filters: {
      search,
      statusId: statusId ? statusId : undefined,
      category: category ? category : undefined,
      companyType: companyType ? companyType : undefined,
      gender: gender ? gender : undefined,
      legalStatus: legalStatus ? legalStatus : undefined,
      sector: sector ? sector : undefined,
      amountRange,
      minCompletion: minCompletion ? parseInt(minCompletion) : undefined,
      provinceId,
      minAmount,
      maxAmount,
      isWomanLed,
      isRefugeeLed,
      hasClimateImpact,
      documentsCorrected,
      fromDate,
      toDate,
      isProfileComplete: true,
    },
  };
};

// Fonction pour construire l'URL avec les paramètres
export const buildUrlWithParams = (
  baseUrl: string,
  pagination: { pageIndex: number; pageSize: number },
  filters: Omit<MPMEFilters, 'page' | 'limit'>
): string => {
  const params = new URLSearchParams();

  // Pagination
  if (pagination.pageIndex > 0) {
    params.set('page', (pagination.pageIndex + 1).toString());
  }
  if (pagination.pageSize !== 10) {
    params.set('limit', pagination.pageSize.toString());
  }

  // Filtres texte/recherche
  if (filters.search) params.set('search', filters.search);

  // Filtres simples (string)
  if (filters.statusId) params.set('statusId', filters.statusId.toLocaleString());
  if (filters.category) params.set('category', filters.category);
  if (filters.companyType) params.set('companyType', filters.companyType);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.legalStatus) params.set('legalStatus', filters.legalStatus);
  if (filters.sector) params.set('sector', filters.sector);
  if (filters.amountRange) params.set('amountRange', filters.amountRange);
  if (filters.minCompletion) params.set('minCompletion', filters.minCompletion.toLocaleString());

  // Filtres numériques
  if (filters.provinceId) params.set('provinceId', filters.provinceId.toString());
  if (filters.minAmount) params.set('minAmount', filters.minAmount.toString());
  if (filters.maxAmount) params.set('maxAmount', filters.maxAmount.toString());

  // Filtres booléens
  if (filters.isWomanLed !== undefined) params.set('isWomanLed', filters.isWomanLed.toString());
  if (filters.isRefugeeLed !== undefined) params.set('isRefugeeLed', filters.isRefugeeLed.toString());
  if (filters.hasClimateImpact !== undefined) params.set('hasClimateImpact', filters.hasClimateImpact.toString());
  if (filters.documentsCorrected !== undefined) params.set('documentsCorrected', filters.documentsCorrected.toString());

  // Filtres de dates
  if (filters.fromDate) params.set('fromDate', filters.fromDate);
  if (filters.toDate) params.set('toDate', filters.toDate);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Fonction pour réinitialiser tous les filtres
export const resetFilters = (): Omit<MPMEFilters, 'page' | 'limit'> => ({
  isProfileComplete: true,
  search: '',
  statusId: undefined,
  category: undefined,
  companyType: undefined,
  gender: undefined,
  legalStatus: undefined,
  sector: undefined,
  amountRange: undefined,
  minCompletion: undefined,
  provinceId: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  isWomanLed: undefined,
  isRefugeeLed: undefined,
  hasClimateImpact: undefined,
  documentsCorrected: undefined,
  fromDate: undefined,
  toDate: undefined,
});

export default function MPMECandidaturesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialParams = parseUrlParams(searchParams);

  const [pagination, setPagination] = useState(initialParams.pagination);
  const [filters, setFilters] = useState<Omit<MPMEFilters, 'page' | 'limit'>>(initialParams.filters);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { data, isLoading } = useMPMECandidatures({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...filters,
  });

  const updateUrl = useCallback(() => {
    const newUrl = buildUrlWithParams(pathname, pagination, filters);

    if (isInitialLoad) {
      router.replace(newUrl);
      setIsInitialLoad(false);
    } else {
      router.push(newUrl);
    }
  }, [pathname, pagination, filters, router, isInitialLoad]);

  useEffect(() => {
    updateUrl();
  }, [pagination, filters, updateUrl]);

  useEffect(() => {
    const handlePopState = () => {
      const newParams = parseUrlParams(new URLSearchParams(window.location.search));
      setPagination(newParams.pagination);
      setFilters(newParams.filters);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleFilterChange = (newFilters: Partial<MPMEFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({ isProfileComplete: true });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handlePaginationChange = (newPagination: typeof pagination) => {
    setPagination(newPagination);
  };

  const candidatures = data?.data || [];
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const { data: allData } = useMPMECandidatures({
    page: 1,
    limit: 3000,
    ...filters,
  });
  const exportData = allData?.data || [];

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
        </div>
      </PageHeader>

      <MPMECandidaturesTable
        key={`page-${pagination.pageIndex}-${pagination.pageSize}`}
        data={candidatures}
        isLoading={isLoading}
        totalItems={totalItems}
        totalPages={totalPages}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
    </>
  );
}