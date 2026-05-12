'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Text, Title, Button } from 'rizzui';
import {
  PiEnvelope,
  PiDeviceMobile,
  PiBell,
  PiWhatsappLogo,
  PiUser,
  PiMagicWand,
  PiUsers,
  PiCalendarBlank,
  PiWarningCircle,
  PiCheckCircle,
  PiClock,
  PiX,
  PiHashStraight,
  PiLightning,
} from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Notification } from './columns';

const CHANNEL_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  EMAIL:    { label: 'Email',    bg: 'bg-blue-50',    text: 'text-blue-600',    icon: PiEnvelope },
  SMS:      { label: 'SMS',      bg: 'bg-green-50',   text: 'text-green-600',   icon: PiDeviceMobile },
  IN_APP:   { label: 'In-App',   bg: 'bg-purple-50',  text: 'text-purple-600',  icon: PiBell },
  WHATSAPP: { label: 'WhatsApp', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: PiWhatsappLogo },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; strip: string; icon: any }> = {
  SENT:    { label: 'Envoyé',     bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', strip: 'bg-green-500',  icon: PiCheckCircle },
  FAILED:  { label: 'Échoué',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   strip: 'bg-red-500',    icon: PiWarningCircle },
  PENDING: { label: 'En attente', bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', strip: 'bg-amber-400',  icon: PiClock },
};

const TYPE_LABELS: Record<string, string> = {
  PRESELECTION: 'Présélection',
  REJECTION:    'Rejet',
  BULK:         'Groupé',
  INDIVIDUAL:   'Individuel',
};

const SENT_BY_CONFIG: Record<string, { label: string; icon: any }> = {
  AUTOMATIC: { label: 'Automatique', icon: PiMagicWand },
  MANUAL:    { label: 'Manuel',      icon: PiUser },
  BULK:      { label: 'Groupé',      icon: PiUsers },
};

const TRIGGER_LABELS: Record<string, string> = {
  PRESELECTION: 'Présélection',
  REJECTION:    'Rejet',
  SELECTION:    'Sélection',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface NotificationDetailModalProps {
  notification: Notification;
}

export default function NotificationDetailModal({ notification }: NotificationDetailModalProps) {
  const { closeModal } = useModal();

  const channel = CHANNEL_CONFIG[notification.channel] ?? CHANNEL_CONFIG.EMAIL;
  const ChannelIcon = channel.icon;
  const status = STATUS_CONFIG[notification.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const sentBy = SENT_BY_CONFIG[notification.sentByType] ?? SENT_BY_CONFIG.MANUAL;
  const SentByIcon = sentBy.icon;

  const formatDate = (date: string) => {
    if (!date) return '—';
    return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl">
      {/* En-tête */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar initiales */}
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
            {getInitials(notification.recipientName || 'NN')}
          </div>
          <div>
            <Title as="h3" className="text-base font-semibold leading-tight text-gray-900">
              {notification.recipientName || '—'}
            </Title>
            <Text className="text-xs text-gray-400">{notification.recipientEmail || '—'}</Text>
          </div>
        </div>
        <button
          onClick={closeModal}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <PiX className="size-4" />
        </button>
      </div>

      {/* Chips info */}
      <div className="flex flex-wrap items-center gap-2 border-y border-gray-100 bg-gray-50 px-6 py-3">
        {/* Code */}
        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-mono font-semibold text-primary-600 ring-1 ring-gray-200">
          <PiHashStraight className="size-3" />
          {notification.applicationCode}
        </span>

        {/* Canal */}
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${channel.bg} ${channel.text} ring-current/20`}>
          <ChannelIcon className="size-3.5" />
          {channel.label}
        </span>

        {/* Type */}
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
          {TYPE_LABELS[notification.type] ?? notification.type}
        </span>

        {/* Statut */}
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${status.bg} ${status.text} ${status.border}`}>
          <StatusIcon className="size-3.5" />
          {status.label}
        </span>

        {notification.triggerAction && (
          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs text-gray-500 ring-1 ring-gray-200">
            <PiLightning className="size-3.5 text-amber-400" />
            {TRIGGER_LABELS[notification.triggerAction]}
          </span>
        )}
      </div>

      {/* Corps scrollable */}
      <div className="px-6 py-5 space-y-5">

        {/* Contenu du message */}
        <div className="bg-white">
          {/* En-tête email */}
          <div className="border-b border-gray-100 py-3">
            <Text className="text-xs text-gray-400">Sujet</Text>
            <Text className="font-semibold text-gray-900">{notification.subject || '—'}</Text>
          </div>

          {/* Corps */}
          <div className="max-h-72 overflow-y-auto overflow-x-hidden pt-4 [&_*]:max-w-full [&_img]:h-auto [&_table]:w-full [&_td]:break-words">
            <div
              className="text-sm leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{
                __html: notification.content || notification.message || '<p class="text-gray-400 italic">Aucun contenu disponible.</p>',
              }}
            />
          </div>
        </div>

        {/* Erreur */}
        {notification.error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
            <PiWarningCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div>
              <Text className="mb-0.5 text-xs font-semibold text-red-600">Erreur d'envoi</Text>
              <Text className="text-sm text-red-700">{notification.error}</Text>
            </div>
          </div>
        )}

        {/* Informations d'envoi */}
        <div>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Envoi
          </Text>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-gray-100">
                <PiCalendarBlank className="size-4 text-gray-400" />
              </div>
              <div>
                <Text className="text-xs text-gray-400">Date d'envoi</Text>
                <Text className="text-sm font-medium text-gray-700">{formatDate(notification.sentAt)}</Text>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-gray-100">
                <SentByIcon className="size-4 text-gray-400" />
              </div>
              <div>
                <Text className="text-xs text-gray-400">Envoyé par</Text>
                <Text className="text-sm font-medium text-gray-700">
                  {notification.sentBy?.name ?? '—'}
                </Text>
                <Text className="text-xs text-gray-400">{sentBy.label}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="flex justify-end border-t border-gray-100 px-6 py-4">
        <Button variant="outline" size="sm" onClick={closeModal}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
