'use client';

import { Checkbox, Text, Button } from 'rizzui';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import DateCell from '@core/ui/date-cell';
import TableAvatar from '@core/ui/avatar-card';
import {
  PiArrowClockwise,
  PiMagicWand,
  PiUser,
  PiUsers,
  PiEnvelope,
  PiDeviceMobile,
  PiBell,
  PiWhatsappLogo,
} from 'react-icons/pi';

type NotificationStatus = 'SENT' | 'FAILED' | 'PENDING';
type NotificationType = 'PRESELECTION' | 'REJECTION' | 'BULK' | 'INDIVIDUAL';
type SentByType = 'AUTOMATIC' | 'MANUAL' | 'BULK';

export interface Notification {
  id: number;
  recipientName: string;
  recipientEmail: string;
  applicationCode: string;
  channel: 'EMAIL' | 'SMS' | 'IN_APP' | 'WHATSAPP';
  type: NotificationType;
  status: NotificationStatus;
  subject: string;
  message?: string;
  sentAt: string;
  error?: string;
  sentBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  sentByType: SentByType;
  triggerAction?: 'PRESELECTION' | 'REJECTION' | 'SELECTION';
}

const STATUS_CONFIG: Record<NotificationStatus, { label: string }> = {
  SENT:    { label: 'Envoyé' },
  FAILED:  { label: 'Échoué' },
  PENDING: { label: 'En attente' },
};

const TYPE_CONFIG: Record<NotificationType, { label: string }> = {
  PRESELECTION: { label: 'Présélection' },
  REJECTION:    { label: 'Rejet' },
  BULK:         { label: 'Groupé' },
  INDIVIDUAL:   { label: 'Individuel' },
};

const CHANNEL_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  EMAIL:    { label: 'Email',    color: 'text-blue-600 bg-blue-50',      icon: PiEnvelope },
  SMS:      { label: 'SMS',      color: 'text-green-600 bg-green-50',    icon: PiDeviceMobile },
  IN_APP:   { label: 'In-App',   color: 'text-purple-600 bg-purple-50',  icon: PiBell },
  WHATSAPP: { label: 'WhatsApp', color: 'text-emerald-600 bg-emerald-50', icon: PiWhatsappLogo },
};

const SENT_BY_CONFIG: Record<SentByType, { label: string; icon: any }> = {
  AUTOMATIC: { label: 'Auto',   icon: PiMagicWand },
  MANUAL:    { label: 'Manuel', icon: PiUser },
  BULK:      { label: 'Groupé', icon: PiUsers },
};

export const notificationColumns = (
  onResend?: (notification: Notification) => void,
  onView?: (notification: Notification) => void,
  onDelete?: (notification: Notification) => void
) => [
  {
    id: 'select',
    header: ({ table }: any) => (
      <Checkbox
        aria-label="Tout sélectionner"
        checked={table.getIsAllRowsSelected()}
        onChange={() => table.toggleAllRowsSelected()}
        className="cursor-pointer"
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        aria-label="Sélectionner"
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
        className="cursor-pointer"
      />
    ),
    size: 40,
  },
  {
    id: 'code',
    header: 'Code',
    accessorKey: 'applicationCode',
    cell: ({ row }: any) => (
      <Text className="font-mono text-xs font-semibold text-primary-600">
        #{row.original.applicationCode}
      </Text>
    ),
    size: 100,
  },
  {
    id: 'avatar',
    header: 'Candidat',
    accessorKey: 'recipientName',
    cell: ({ row }: any) => (
      <TableAvatar
        src=""
        name={row.original.recipientName}
        description={row.original.recipientEmail}
      />
    ),
    size: 200,
  },
  {
    id: 'channel',
    header: 'Canal',
    accessorKey: 'channel',
    cell: ({ row }: any) => {
      const cfg = CHANNEL_CONFIG[row.original.channel] ?? CHANNEL_CONFIG.EMAIL;
      const Icon = cfg.icon;
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
          <Icon className="size-3.5" />
          {cfg.label}
        </span>
      );
    },
    size: 100,
  },
  {
    id: 'type',
    header: 'Type',
    accessorKey: 'type',
    cell: ({ row }: any) => {
      const label = TYPE_CONFIG[row.original.type as NotificationType]?.label ?? row.original.type;
      return getStatusBadge(label);
    },
    size: 120,
  },
  {
    id: 'subject',
    header: 'Sujet / Motif',
    accessorKey: 'subject',
    cell: ({ row }: any) => (
      <div className="max-w-[220px]">
        <Text className="truncate text-sm text-gray-700">
          {row.original.subject}
        </Text>
        {row.original.message && (
          <Text className="mt-0.5 truncate text-xs text-gray-400 italic">
            Motif : {row.original.message}
          </Text>
        )}
        {row.original.error && (
          <Text className="mt-0.5 text-xs text-red-400">
            ⚠ {row.original.error}
          </Text>
        )}
      </div>
    ),
    size: 250,
  },
  {
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    cell: ({ row }: any) => {
      const label = STATUS_CONFIG[row.original.status as NotificationStatus]?.label ?? row.original.status;
      return getStatusBadge(label);
    },
    size: 110,
  },
  {
    id: 'date',
    header: 'Date',
    accessorKey: 'sentAt',
    cell: ({ row }: any) => <DateCell date={new Date(row.original.sentAt)} />,
    size: 120,
  },
  {
    id: 'sentBy',
    header: 'Envoyé par',
    accessorKey: 'sentBy',
    cell: ({ row }: any) => {
      const cfg = SENT_BY_CONFIG[row.original.sentByType as SentByType] ?? SENT_BY_CONFIG.MANUAL;
      const Icon = cfg.icon;
      return (
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-gray-400" />
          <Text className="text-sm font-medium text-gray-700">
            {row.original.sentBy?.name ?? '—'}
          </Text>
        </div>
      );
    },
    size: 160,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }: any) => {
      const notification = row.original;
      return notification.status === 'FAILED' ? (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={() => onResend?.(notification)}
        >
          <PiArrowClockwise className="size-3.5" />
          Renvoyer
        </Button>
      ) : null;
    },
    size: 50,
  },
];
