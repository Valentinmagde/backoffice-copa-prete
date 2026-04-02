'use client';

import { Input } from 'rizzui';
import cn from '@core/utils/class-names';
import Table from '@core/components/table';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import WidgetCard from '@core/components/cards/widget-card';
import TablePagination from '@core/components/table/pagination';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { useRecentApplications } from '@/lib/api/hooks/use-dashboard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useMemo } from 'react';

const colonnesCandidatures = [
  {
    id: 'applicationCode',
    header: 'Code',
    accessorKey: 'applicationCode',
    cell: (info: any) => {
      const value = info.getValue();
      return <span className="font-mono text-sm">{value || '-'}</span>;
    },
  },
  {
    id: 'firstName',
    header: 'Candidat',
    accessorKey: 'firstName',
    cell: (info: any) => {
      const row = info.row.original;
      return `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-';
    },
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    cell: (info: any) => info.getValue() || '-',
  },
  {
    id: 'sector',
    header: 'Secteur',
    accessorKey: 'sector',
    cell: (info: any) => info.getValue() || 'Non spécifié',
  },
  {
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    cell: (info: any) => {
      const statut = info.getValue();
      const libelles: Record<string, string> = {
        Registered: 'Enregistré',
        Pending: 'En attente',
        Validated: 'Validé',
        Rejected: 'Rejeté',
      };
      return (
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
          {libelles[statut] || statut}
        </span>
      );
    },
  },
  {
    id: 'registrationDate',
    header: "Date d'inscription",
    accessorKey: 'registrationDate',
    cell: (info: any) => {
      const date = info.getValue();
      if (!date) return '-';
      return format(new Date(date), 'dd MMM yyyy', { locale: fr });
    },
  },
];

export default function RecentCustomers({ className }: { className?: string }) {
  const { data: candidatures, isLoading } = useRecentApplications(21);

  // S'assurer que les données sont un tableau
  const tableData = useMemo(() => {
    if (!candidatures) return [];
    // Si les données sont dans un wrapper, les extraire
    if (Array.isArray(candidatures)) return candidatures;
    if (candidatures.data && Array.isArray(candidatures.data)) return candidatures.data;
    return [];
  }, [candidatures]);

  const { table, setData } = useTanStackTable({
    tableData: tableData,
    columnConfig: colonnesCandidatures,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 7,
        },
      },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  useEffect(() => {
    console.log('Data:', candidatures);
    console.log('Table:', table);
  }, [table, candidatures]);

  if (isLoading) {
    return (
      <WidgetCard title="Dernières candidatures" className={cn('p-0 lg:p-0', className)}>
        <div className="p-6 text-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  if (tableData.length === 0) {
    return (
      <WidgetCard title="Dernières candidatures" className={cn('p-0 lg:p-0', className)}>
        <div className="p-6 text-center">
          <p className="text-gray-500">Aucune candidature trouvée</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Dernières candidatures"
      className={cn('p-0 lg:p-0', className)}
      headerClassName="mb-4 px-5 pt-5 lg:px-7 lg:pt-7"
      action={
        <Input
          type="search"
          placeholder="Rechercher..."
          value={table.getState().globalFilter ?? ''}
          onClear={() => table.setGlobalFilter('')}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          inputClassName="h-9"
          clearable={true}
          prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
        />
      }
    >
      <Table table={table} variant="modern" />
      <TablePagination table={table} className="p-4" />
    </WidgetCard>
  );
}