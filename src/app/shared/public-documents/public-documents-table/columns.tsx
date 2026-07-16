'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Checkbox, Flex, Text, Tooltip, ActionIcon } from 'rizzui';
import { PiPencil } from 'react-icons/pi';
import DateCell from '@core/ui/date-cell';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { useModal } from '@/app/shared/modal-views/use-modal';
import CreatePublicDocument from '../create-public-document';
import type { PublicDocument } from '@/lib/api/types/public-documents.types';

const columnHelper = createColumnHelper<PublicDocument>();

function PublicDocumentRowActions({
  document,
  onDelete,
}: {
  document: PublicDocument;
  onDelete: () => void;
}) {
  const { openModal } = useModal();

  return (
    <Flex align="center" justify="end" gap="3" className="pe-3">
      <Tooltip size="sm" content="Modifier le document" placement="top" color="invert">
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label="Modifier le document"
          onClick={() =>
            openModal({ view: <CreatePublicDocument document={document} />, customSize: 700 })
          }
        >
          <PiPencil className="h-4 w-4" />
        </ActionIcon>
      </Tooltip>
      <TableRowActionGroup
        hasEdit={false}
        hasView={false}
        deletePopoverTitle="Supprimer ce document"
        deletePopoverDescription={`Êtes-vous sûr de vouloir supprimer "${document.titleFr ?? document.titleRn ?? 'ce document'}" ? Cette action est irréversible.`}
        onDelete={onDelete}
        className="pe-0"
      />
    </Flex>
  );
}

export const publicDocumentsColumns = [
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

  columnHelper.accessor('titleFr', {
    id: 'title',
    size: 260,
    header: 'Titre',
    cell: ({ row }) => (
      <div>
        <Text className="font-medium text-gray-900">
          {row.original.titleFr ?? row.original.titleRn ?? '—'}
        </Text>
        {(row.original.categoryFr ?? row.original.categoryRn) && (
          <Text className="text-sm text-gray-500">
            {row.original.categoryFr ?? row.original.categoryRn}
          </Text>
        )}
      </div>
    ),
  }),

  columnHelper.display({
    id: 'languages',
    size: 140,
    header: 'Langues',
    cell: ({ row }) => (
      <Flex align="center" gap="2">
        <Badge color={row.original.fileKeyFr ? 'success' : 'secondary'}>FR</Badge>
        <Badge color={row.original.fileKeyRn ? 'success' : 'secondary'}>RN</Badge>
      </Flex>
    ),
  }),

  columnHelper.accessor('displayOrder', {
    id: 'displayOrder',
    size: 90,
    header: 'Ordre',
    cell: ({ row }) => <Text>{row.original.displayOrder}</Text>,
  }),

  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 200,
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
    size: 150,
    header: 'Actions',
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <PublicDocumentRowActions
        document={row.original}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];
