'use client';

import AvatarCard from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Checkbox, Flex } from 'rizzui';
import { UsersTableDataType } from '.';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';

const columnHelper = createColumnHelper<UsersTableDataType>();

export const usersColumns = [
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

  columnHelper.display({
    id: 'id',
    size: 100,
    header: 'ID',
    cell: ({ row }) => <>#{row.original.id}</>,
  }),

  columnHelper.accessor('fullName', {
    id: 'fullName',
    size: 300,
    header: 'Nom',
    enableSorting: false,
    cell: (info) => {
      const { firstName, lastName, email, profilePhotoUrl } = info.row.original;
      const fullName =
        [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur';

      return (
        <AvatarCard
          src={profilePhotoUrl}
          name={fullName}
          description={email}
        />
      );
    },
  }),

  columnHelper.accessor('role', {
    id: 'role',
    size: 150,
    header: 'Rôle',
    filterFn: (row, columnId, filterValue) => {
      // console.log(row, columnId,row.getValue(columnId), filterValue);
      return row.getValue(columnId) === filterValue;
    },
    cell: ({ row }) => row.original.role,
  }),

  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 200,
    header: 'Date de création',
    cell: ({ row }) => (
      <DateCell date={new Date(row.original.createdAt)} />
    ),
  }),

  // columnHelper.display({
  //   id: 'permissions',
  //   size: 250,
  //   header: 'Permissions',
  //   cell: ({ row }) => (
  //     <Flex align="center" gap="2">
  //       {row.original.permissions.map((permission) => (
  //         <Badge
  //           rounded="lg"
  //           key={permission}
  //           variant="outline"
  //           className="border-muted font-normal text-gray-500"
  //         >
  //           {permission}
  //         </Badge>
  //       ))}
  //     </Flex>
  //   ),
  // }),

  columnHelper.accessor('status', {
    id: 'status',
    size: 150,
    header: 'Statut',
    enableSorting: false,
    cell: ({ row }) => getStatusBadge(row.original.status),
  }),

  columnHelper.display({
    id: 'action',
    size: 140,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <TableRowActionGroup
        viewUrl={`/settings/${row.original.id}/profile?from=rolespermissions`}
        editUrl={`/settings/${row.original.id}/profile-settings?from=rolespermissions`}
        deletePopoverTitle={`Supprimer cet utilisateur`}
        deletePopoverDescription={`Êtes-vous sûr de vouloir supprimer l'utilisateur #${row.original.id} ?`}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];