'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Text, ActionIcon, Tooltip } from 'rizzui';
import { Complaint } from '@/lib/api/types/complaint.types';
import DateCell from '@core/ui/date-cell';
import { PiEye } from 'react-icons/pi';

const columnHelper = createColumnHelper<Complaint>();

const TYPE_META: Record<string, { label: string; color: string }> = {
  'Technical Issue':      { label: 'Problème technique',     color: 'bg-blue-100 text-blue-700' },
  'Process Irregularity': { label: 'Irrégularité sélection', color: 'bg-orange-100 text-orange-700' },
  'Staff Misconduct':     { label: 'Comportement',           color: 'bg-yellow-100 text-yellow-700' },
  'Corruption':           { label: 'Corruption',             color: 'bg-red-100 text-red-700' },
  'GBV/EAS-HS':           { label: 'VBG / EAS-HS',           color: 'bg-red-200 text-red-800' },
  'Other':                { label: 'Autre',                  color: 'bg-gray-100 text-gray-600' },
};

const STATUS_META: Record<string, { label: string; color: any }> = {
  RECEIVED:     { label: 'Reçue',    color: 'secondary' },
  UNDER_REVIEW: { label: 'En cours', color: 'warning' },
  RESOLVED:     { label: 'Résolue',  color: 'success' },
  REJECTED:     { label: 'Rejetée',  color: 'danger' },
  CLOSED:       { label: 'Clôturée', color: 'default' },
};

export const complaintsColumns = () => [
  columnHelper.accessor('referenceNumber', {
    id: 'referenceNumber',
    size: 160,
    header: 'Référence',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Text className="font-mono text-xs font-semibold text-gray-700">
          {row.original.referenceNumber}
        </Text>
        {row.original.generatedVbgAlert && <span className="text-xs">🚨</span>}
        {row.original.isConfidential && (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
            confidentiel
          </span>
        )}
      </div>
    ),
  }),

  columnHelper.display({
    id: 'complaintType',
    size: 170,
    header: 'Type',
    cell: ({ row }) => {
      const meta = TYPE_META[row.original.complaintType?.name] ?? TYPE_META['Other'];
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${meta.color}`}>
          {meta.label}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: 'plaignant',
    size: 160,
    header: 'Plaignant',
    cell: ({ row }) =>
      row.original.isAnonymous ? (
        <Text className="italic text-gray-400 text-sm">Anonyme</Text>
      ) : (
        <Text className="text-sm text-gray-600">{row.original.fullName || '—'}</Text>
      ),
  }),

  columnHelper.accessor('incidentLocation', {
    id: 'incidentLocation',
    size: 140,
    header: 'Lieu',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-600">{row.original.incidentLocation || '—'}</Text>
    ),
  }),

  columnHelper.accessor('submittedAt', {
    id: 'submittedAt',
    size: 120,
    header: 'Date',
    cell: ({ row }) =>
      row.original.submittedAt ? (
        <DateCell date={new Date(row.original.submittedAt)} />
      ) : (
        <Text className="text-gray-400">—</Text>
      ),
  }),

  columnHelper.display({
    id: 'status',
    size: 120,
    header: 'Statut',
    cell: ({ row }) => {
      const code = row.original.status?.code || 'RECEIVED';
      const meta = STATUS_META[code] ?? { label: code, color: 'default' };
      return <Badge variant="flat" color={meta.color}>{meta.label}</Badge>;
    },
  }),

  columnHelper.display({
    id: 'action',
    size: 60,
    cell: ({ row, table }) => (
      <div className="flex items-center justify-end pe-3">
        <Tooltip size="sm" content="Voir la plainte" placement="top" color="invert">
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() => (table.options.meta as any)?.onView?.(row.original)}
          >
            <PiEye className="size-4" />
          </ActionIcon>
        </Tooltip>
      </div>
    ),
  }),
];
