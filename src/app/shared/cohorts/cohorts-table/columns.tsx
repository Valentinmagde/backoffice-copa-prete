// app/shared/cohorts/columns.tsx
'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Checkbox, Flex, Text, Tooltip, ActionIcon } from 'rizzui';
import { PiEye, PiPencil, PiTrash, PiUsers } from 'react-icons/pi';
import DateCell from '@core/ui/date-cell';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { CohortDataType } from '.';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { formatDate } from '@core/utils/format-date';

const columnHelper = createColumnHelper<CohortDataType>();

const statusConfig = {
  active: { label: 'Actif', color: 'success' },
  inactive: { label: 'Inactif', color: 'danger' },
  pending: { label: 'En attente', color: 'warning' },
};

export const cohortsColumns = [
  columnHelper.display({
    id: 'select',
    size: 50,
    header: ({ table }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Sélectionner toutes les lignes"
        checked={table.getIsAllPageRowsSelected()}
        onChange={() => table.toggleAllPageRowsSelected()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Sélectionner la ligne"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),

  columnHelper.accessor('id', {
    id: 'id',
    size: 80,
    header: 'ID',
    cell: ({ row }) => <span className="font-mono text-xs">#{row.original.id}</span>,
  }),

  columnHelper.accessor('name', {
    id: 'name',
    size: 250,
    header: 'Nom de la cohorte',
    cell: ({ row }) => (
      <div>
        <Text className="font-medium text-gray-900">{row.original.nameFr}</Text>
        {/* <Text className="text-sm text-gray-500 line-clamp-1">{row.original.description}</Text> */}
      </div>
    ),
  }),

  columnHelper.accessor('participantCount', {
    id: 'participantCount',
    size: 150,
    header: 'Participants',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PiUsers className="h-4 w-4 text-gray-400" />
        <Text className="font-semibold text-gray-700">{row.original.participantCount}</Text>
        <Text className="text-gray-400">inscrits</Text>
      </div>
    ),
  }),

  columnHelper.accessor('startDate', {
    id: 'startDate',
    size: 180,
    header: 'Période',
    cell: ({ row }) => (
      <div>
        <div>{formatDate(new Date(row.original.registrationStartDate), 'D MMMM YYYY')}</div>
        <div>
          - {formatDate(new Date(row.original.registrationEndDate), 'D MMMM YYYY')}
        </div>
      </div>
    ),
  }),

  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 250,
    header: 'Date de création',
    cell: ({ row }) => <DateCell date={new Date(row.original.createdAt)} />,
  }),

  columnHelper.accessor('isActive', {
    id: 'isActive',
    size: 120,
    header: 'Statut',
    filterFn: (row, columnId, filterValue) => {
        const status = row.getValue(columnId) ? 'active' : 'inactive';
        if (!filterValue || filterValue.length === 0) return true;
        if (Array.isArray(filterValue)) {
            return filterValue.includes(status);
        }
        return filterValue === status;
    },
    cell: ({ row }) => getStatusBadge(row.original.isActive ? 'active' : 'inactive'),
  }),

  columnHelper.display({
    id: 'action',
    size: 120,
    header: 'Actions',
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <TableRowActionGroup
        viewUrl={routes.cohorts.details(row.original.id)}
        hasEdit={false}
        deletePopoverTitle="Supprimer cette cohorte"
        deletePopoverDescription={`Êtes-vous sûr de vouloir supprimer la cohorte "${row.original.name}" ? Cette action est irréversible.`}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];