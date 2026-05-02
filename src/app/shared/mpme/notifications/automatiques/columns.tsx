'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Button, Text, Tooltip } from 'rizzui';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { PiStar, PiXCircle, PiCheckCircle } from 'react-icons/pi';

export type NotifType = 'PRESELECTION' | 'REJECTION' | 'SELECTION';

export interface Candidat {
    id: number;
    name: string;
    email: string;
    applicationCode: string;
    status: string;
    preSelectedComment?: string;
    rejectedComment?: string;
    lastNotifiedAt?: string;
}

export const NOTIF_CONFIG: Record<NotifType, {
    label: string;
    icon: React.ElementType;
    color: any;
    badgeColor: any;
}> = {
    PRESELECTION: {
        label: 'Présélection',
        icon: PiStar,
        color: 'primary',
        badgeColor: 'primary',
    },
    REJECTION: {
        label: 'Rejet',
        icon: PiXCircle,
        color: 'danger',
        badgeColor: 'danger',
    },
    SELECTION: {
        label: 'Sélection',
        icon: PiCheckCircle,
        color: 'success',
        badgeColor: 'success',
    },
};

export const STATUS_TO_NOTIF_TYPE: Record<string, NotifType> = {
    PRE_SELECTED: 'PRESELECTION',
    REJECTED: 'REJECTION',
    SELECTED: 'SELECTION',
    VALIDATED: 'SELECTION',
};

const columnHelper = createColumnHelper<Candidat>();

export const getColumns = (
    onSend: (candidat: Candidat, type: NotifType) => void,
    isSending?: boolean
) => [
        columnHelper.accessor('applicationCode', {
            id: 'applicationCode',
            header: 'Code',
            size: 100,
            cell: ({ row }) => (
                <Text className="font-mono text-xs font-semibold text-primary-600">
                    #{row.original.applicationCode}
                </Text>
            ),
        }),
        columnHelper.accessor('name', {
            id: 'name',
            header: 'Candidat',
            size: 220,
            cell: ({ row }) => (
                <TableAvatar
                    src=""
                    name={row.original.name}
                    description={row.original.email}
                />
            ),
        }),
        columnHelper.accessor('status', {
            id: 'status',
            header: 'Statut',
            size: 130,
            cell: ({ row }) => {
                const type = STATUS_TO_NOTIF_TYPE[row.original.status];
                if (!type) return null;
                return getStatusBadge(NOTIF_CONFIG[type].label);
            },
        }),
        columnHelper.display({
            id: 'comment',
            header: 'Commentaire',
            size: 220,
            cell: ({ row }) => {
                const c = row.original;
                const comment = c.status === 'REJECTED' ? c.rejectedComment : c.preSelectedComment;
                return comment ? (
                    <Tooltip content={comment} placement="top">
                        <Text className="max-w-[200px] truncate text-xs italic text-gray-500">
                            {comment}
                        </Text>
                    </Tooltip>
                ) : (
                    <Text className="text-xs text-gray-300">—</Text>
                );
            },
        }),
        columnHelper.accessor('lastNotifiedAt', {
            id: 'lastNotifiedAt',
            header: 'Dernier envoi',
            size: 140,
            cell: ({ row }) => row.original.lastNotifiedAt
                ? <DateCell date={new Date(row.original.lastNotifiedAt)} />
                : <Text className="text-xs text-gray-300">Jamais</Text>,
        }),
        columnHelper.display({
            id: 'action',
            header: '',
            size: 120,
            cell: ({ row }) => {
                const type = STATUS_TO_NOTIF_TYPE[row.original.status];
                if (!type) return null;
                const cfg = NOTIF_CONFIG[type];
                const Icon = cfg.icon;
                return (
                    <Button
                        size="sm"
                        color={cfg.color}
                        variant="flat"
                        className="gap-1.5 whitespace-nowrap"
                        onClick={() => onSend(row.original, type)}
                        disabled={isSending}
                    >
                        <Icon className="size-3.5" />
                        Envoyer
                    </Button>
                );
            },
        }),
    ];