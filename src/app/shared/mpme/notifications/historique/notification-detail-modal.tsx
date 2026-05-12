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
  PiCalendar,
  PiWarning,
  PiCheckCircle,
  PiClock,
  PiX,
} from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Notification } from './columns';

const CHANNEL_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  EMAIL:    { label: 'Email',    color: 'text-blue-600 bg-blue-50',       icon: PiEnvelope },
  SMS:      { label: 'SMS',      color: 'text-green-600 bg-green-50',     icon: PiDeviceMobile },
  IN_APP:   { label: 'In-App',   color: 'text-purple-600 bg-purple-50',   icon: PiBell },
  WHATSAPP: { label: 'WhatsApp', color: 'text-emerald-600 bg-emerald-50', icon: PiWhatsappLogo },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  SENT:    { label: 'Envoyé',     color: 'text-green-600 bg-green-50',  icon: PiCheckCircle },
  FAILED:  { label: 'Échoué',    color: 'text-red-600 bg-red-50',      icon: PiWarning },
  PENDING: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50', icon: PiClock },
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
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Title as="h3" className="text-lg font-semibold">
            Détail de la notification
          </Title>
          <Text className="mt-1 font-mono text-xs font-semibold text-primary-600">
            #{notification.applicationCode}
          </Text>
        </div>
        <button
          onClick={closeModal}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <PiX className="size-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Destinataire */}
        <section className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Destinataire
          </Text>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text className="text-xs text-gray-500">Nom</Text>
              <Text className="font-medium">{notification.recipientName || '—'}</Text>
            </div>
            <div>
              <Text className="text-xs text-gray-500">Email</Text>
              <Text className="font-medium">{notification.recipientEmail || '—'}</Text>
            </div>
          </div>
        </section>

        {/* Canal & Statut */}
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-100 p-3">
            <Text className="mb-2 text-xs text-gray-500">Canal</Text>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${channel.color}`}>
              <ChannelIcon className="size-3.5" />
              {channel.label}
            </span>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <Text className="mb-2 text-xs text-gray-500">Type</Text>
            <Text className="font-medium text-sm">
              {TYPE_LABELS[notification.type] ?? notification.type}
            </Text>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <Text className="mb-2 text-xs text-gray-500">Statut</Text>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
              <StatusIcon className="size-3.5" />
              {status.label}
            </span>
          </div>
        </section>

        {/* Sujet & Message */}
        <section className="rounded-lg border border-gray-100 p-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Contenu
          </Text>
          <div className="space-y-3">
            <div>
              <Text className="text-xs text-gray-500">Sujet</Text>
              <Text className="font-medium">{notification.subject || '—'}</Text>
            </div>
            {notification.message && (
              <div>
                <Text className="text-xs text-gray-500">Motif</Text>
                <Text className="text-sm text-gray-700">{notification.message}</Text>
              </div>
            )}
          </div>
        </section>

        {/* Erreur */}
        {notification.error && (
          <section className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <PiWarning className="mt-0.5 size-4 shrink-0 text-red-500" />
              <div>
                <Text className="mb-1 text-xs font-semibold text-red-600">Erreur d'envoi</Text>
                <Text className="text-sm text-red-700">{notification.error}</Text>
              </div>
            </div>
          </section>
        )}

        {/* Envoi */}
        <section className="rounded-lg border border-gray-100 p-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Informations d'envoi
          </Text>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <PiCalendar className="mt-0.5 size-4 text-gray-400" />
              <div>
                <Text className="text-xs text-gray-500">Date d'envoi</Text>
                <Text className="text-sm font-medium">{formatDate(notification.sentAt)}</Text>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <SentByIcon className="mt-0.5 size-4 text-gray-400" />
              <div>
                <Text className="text-xs text-gray-500">Envoyé par</Text>
                <Text className="text-sm font-medium">
                  {notification.sentBy?.name ?? '—'}
                </Text>
                <Text className="text-xs text-gray-400">{sentBy.label}</Text>
              </div>
            </div>
            {notification.triggerAction && (
              <div>
                <Text className="text-xs text-gray-500">Action déclenchante</Text>
                <Text className="text-sm font-medium">
                  {TRIGGER_LABELS[notification.triggerAction] ?? notification.triggerAction}
                </Text>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Pied de page */}
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={closeModal}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
