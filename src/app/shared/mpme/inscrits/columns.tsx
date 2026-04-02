'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Text, Tooltip, ActionIcon } from 'rizzui';
import Link from 'next/link';
import { PiEye, PiPencil, PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { MPMEInscrit } from '@/lib/api/types/mpme.types';

const columnHelper = createColumnHelper<MPMEInscrit>();

export const mpmeInscritsColumns = (expanded: boolean = true) => {
    const columns = [
        columnHelper.display({
            id: 'id',
            size: 100,
            header: 'ID',
            cell: ({ row }) => (
                <Text className="font-medium text-gray-700">
                    <Link href={routes.mpme.inscrits.details(row.original.id)} className="text-primary-600 hover:underline">
                        {row.original.id}
                    </Link></Text>
            ),
        }),
        columnHelper.accessor('representativeName', {
            id: 'representative',
            size: 200,
            header: 'Représentant',
            cell: ({ row }) => (
                <TableAvatar
                    name={row.original.representativeName}
                    description={row.original.email}
                />
            ),
        }),
        // columnHelper.accessor('companyName', {
        //     id: 'company',
        //     size: 250,
        //     header: 'Entreprise',
        //     enableSorting: false,
        //     cell: ({ row }) => (
        //         <div>
        //             <Text className="font-medium text-gray-700">{row.original.companyName}</Text>
        //             <Text className="text-sm text-gray-500">{row.original.sector}</Text>
        //         </div>
        //     ),
        // }),
        columnHelper.accessor('phone', {
            id: 'phone',
            size: 150,
            header: 'Téléphone',
            cell: ({ row }) => (
                <Text className="font-medium text-gray-700">{row.original.phone}</Text>
            ),
        }),
        columnHelper.accessor('province', {
            id: 'province',
            size: 150,
            header: 'Province',
            cell: ({ row }) => (
                <Text className="font-medium text-gray-700">{row.original.province}</Text>
            ),
        }),
        columnHelper.accessor('gender', {
            id: 'gender',
            size: 150,
            header: 'Genre',
            cell: ({ row }) => (
                <Text className="font-medium text-gray-700">{row.original.gender}</Text>
            ),
        }),
        columnHelper.accessor('registrationDate', {
            id: 'registrationDate',
            size: 150,
            header: "Date d'inscription",
            cell: ({ row }) => <DateCell date={new Date(row.original.registrationDate)} />,
        }),
        columnHelper.accessor('profileCompletion', {
            id: 'profileCompletion',
            size: 150,
            header: 'Complétion',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full rounded-full bg-primary-500"
                            style={{ width: `${row.original.profileCompletion}%` }}
                        />
                    </div>
                    <Text className="text-sm font-medium">{row.original.profileCompletion}%</Text>
                </div>
            ),
        }),
        columnHelper.accessor('status', {
            id: 'status',
            size: 120,
            header: 'Statut',
            enableSorting: false,
            cell: ({ row }) => getStatusBadge(row.original.status),
        }),
        columnHelper.display({
            id: 'action',
            size: 120,
            cell: ({
                row,
                table: {
                    options: { meta },
                },
            }) => (
                <TableRowActionGroup
                    hasDelete={false}
                    hasEdit={false}
                    hasView={true}
                    editUrl={routes.mpme.inscrits.edit(row.original.id)}
                    viewUrl={routes.mpme.inscrits.details(row.original.id)}
                    deletePopoverTitle={`Supprimer l'entreprise`}
                    deletePopoverDescription={`Êtes-vous sûr de vouloir supprimer l'entreprise ${row.original.companyName} ?`}
                    onDelete={() => meta?.handleDeleteRow?.(row.original)}
                />
            ),
        }),
    ];

    return expanded ? [expandedRowColumn, ...columns] : columns;
};

// Colonne pour l'expansion des lignes
const expandedRowColumn = columnHelper.display({
    id: 'expandedHandler',
    size: 50,
    cell: ({ row }) => (
        <>
            {row.getCanExpand() && (
                <ActionIcon
                    size="sm"
                    rounded="full"
                    aria-label="Expand row"
                    className="ms-2"
                    variant={row.getIsExpanded() ? 'solid' : 'outline'}
                    onClick={row.getToggleExpandedHandler()}
                >
                    {row.getIsExpanded() ? (
                        <PiCaretUpBold className="size-3.5" />
                    ) : (
                        <PiCaretDownBold className="size-3.5" />
                    )}
                </ActionIcon>
            )}
        </>
    ),
});