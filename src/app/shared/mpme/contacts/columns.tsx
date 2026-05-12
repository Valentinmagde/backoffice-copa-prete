'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Text, ActionIcon, Tooltip } from 'rizzui';
import type { Contact, ContactStatus } from '@/lib/api/types/contact.types';
import DateCell from '@core/ui/date-cell';
import { PiEye } from 'react-icons/pi';

const columnHelper = createColumnHelper<Contact>();

const STATUS_META: Record<ContactStatus, { label: string; color: any }> = {
  PENDING:   { label: 'En attente',  color: 'secondary' },
  READ:      { label: 'Lu',          color: 'warning' },
  RESPONDED: { label: 'Répondu',     color: 'success' },
  CLOSED:    { label: 'Clôturé',     color: 'default' },
};

export const contactsColumns = () => [
  columnHelper.display({
    id: 'fullName',
    size: 180,
    header: 'Nom',
    cell: ({ row }) =>
      row.original.isAnonymous ? (
        <Text className="italic text-gray-400 text-sm">Anonyme</Text>
      ) : (
        <Text className="text-sm font-medium text-gray-800">{row.original.fullName || '—'}</Text>
      ),
  }),

  columnHelper.display({
    id: 'email',
    size: 200,
    header: 'Email',
    cell: ({ row }) =>
      row.original.isAnonymous ? (
        <Text className="italic text-gray-400 text-sm">—</Text>
      ) : (
        <Text className="text-sm text-gray-600">{row.original.email || '—'}</Text>
      ),
  }),

  columnHelper.accessor('subject', {
    id: 'subject',
    size: 220,
    header: 'Sujet',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-700 truncate max-w-[200px]">{row.original.subject}</Text>
    ),
  }),

  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 130,
    header: 'Date',
    cell: ({ row }) => (
      <DateCell date={new Date(row.original.createdAt)} />
    ),
  }),

  columnHelper.accessor('status', {
    id: 'status',
    size: 120,
    header: 'Statut',
    cell: ({ row }) => {
      const meta = STATUS_META[row.original.status] ?? { label: row.original.status, color: 'default' };
      return <Badge variant="flat" color={meta.color}>{meta.label}</Badge>;
    },
  }),

  columnHelper.display({
    id: 'action',
    size: 60,
    cell: ({ row, table }) => (
      <div className="flex items-center justify-end pe-3">
        <Tooltip size="sm" content="Voir le message" placement="top" color="invert">
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
