'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Badge, Text, Button, Textarea } from 'rizzui';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { useContacts, useMarkContactAsRead, useRespondToContact, useCloseContact } from '@/lib/api/hooks/use-contacts';
import type { Contact, ContactStatus } from '@/lib/api/types/contact.types';
import { contactsColumns } from './columns';
import ContactsFilters, { type ContactFiltersState } from './contacts-filters';
import {
  PiEnvelope,
  PiCheckCircle,
  PiArrowsClockwise,
  PiPaperPlaneRight,
  PiX,
  PiPhone,
} from 'react-icons/pi';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_META: Record<ContactStatus, { label: string; variant: any }> = {
  PENDING:   { label: 'En attente',  variant: 'secondary' },
  READ:      { label: 'Lu',          variant: 'warning' },
  RESPONDED: { label: 'Répondu',     variant: 'success' },
  CLOSED:    { label: 'Clôturé',     variant: 'default' },
};

// ─── Modal détail ─────────────────────────────────────────────────────────────

function DetailModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [response, setResponse] = useState(contact.response || '');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const { mutate: markAsRead } = useMarkContactAsRead(contact.id);
  const { mutate: respond, isPending: isSending } = useRespondToContact(contact.id);
  const { mutate: close, isPending: isClosing } = useCloseContact(contact.id);

  useEffect(() => {
    if (contact.status === 'PENDING') {
      markAsRead();
    }
  }, [contact.id]);

  const statusMeta = STATUS_META[contact.status];

  const handleSendResponse = () => {
    if (!response.trim()) return;
    respond(response, {
      onSuccess: () => {
        setShowReplyForm(false);
        onClose();
      },
    });
  };

  const handleClose = () => {
    close(undefined, { onSuccess: onClose });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <Text className="font-bold text-gray-900">{contact.subject}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {new Date(contact.createdAt).toLocaleString('fr-FR')}
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="flat" color={statusMeta.variant}>{statusMeta.label}</Badge>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-2">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Coordonnées */}
          {!contact.isAnonymous && (contact.fullName || contact.email) ? (
            <div className="rounded-lg border border-gray-100 p-4 space-y-2">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Expéditeur</Text>
              {contact.fullName && (
                <Text className="text-sm font-medium text-gray-800">{contact.fullName}</Text>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <PiEnvelope className="size-4 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <PiPhone className="size-4 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-4">
              <Text className="text-sm text-gray-400 italic">Message anonyme</Text>
            </div>
          )}

          {/* Message */}
          <div>
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message</Text>
            <Text className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {contact.message}
            </Text>
          </div>

          {/* Réponse existante */}
          {contact.response && (
            <div className="rounded-lg bg-green-50 border border-green-100 p-4 space-y-1">
              <Text className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                Réponse envoyée
              </Text>
              {contact.respondedAt && (
                <Text className="text-xs text-gray-400">
                  {new Date(contact.respondedAt).toLocaleString('fr-FR')}
                </Text>
              )}
              <Text className="text-sm text-gray-700">{contact.response}</Text>
            </div>
          )}

          {/* Actions */}
          {contact.status !== 'CLOSED' && (
            <div className="border-t pt-4 space-y-3">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</Text>

              {!showReplyForm ? (
                <div className="flex gap-2 flex-wrap">
                  {contact.status !== 'RESPONDED' && !contact.isAnonymous && contact.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowReplyForm(true)}
                    >
                      <PiPaperPlaneRight className="size-4" />
                      Répondre par email
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleClose}
                    isLoading={isClosing}
                  >
                    <PiArrowsClockwise className="size-4" />
                    Clôturer
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    label="Votre réponse"
                    placeholder="Saisissez votre réponse, elle sera envoyée par email à l'expéditeur..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={handleSendResponse}
                      isLoading={isSending}
                      disabled={!response.trim()}
                    >
                      <PiPaperPlaneRight className="size-4" />
                      Envoyer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setShowReplyForm(false)}
                    >
                      <PiX className="size-4" />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {contact.status === 'CLOSED' && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <PiCheckCircle className="size-4" />
                Ce message est clôturé.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ContactsTable() {
  const [filters, setFilters] = useState<ContactFiltersState>({});
  const [selected, setSelected] = useState<Contact | null>(null);

  const { data, isLoading } = useContacts({
    search: filters.search,
    status: filters.status,
  });

  const contacts = useMemo(() => {
    return data?.data ?? [];
  }, [data]);

  const { table, setData } = useTanStackTable<Contact>({
    tableData: contacts,
    columnConfig: contactsColumns(),
    options: {
      meta: { onView: setSelected } as any,
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    setData(contacts);
  }, [contacts]);

  const handleFilterChange = (f: Partial<ContactFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...f }));
  };

  const handleResetFilters = () => setFilters({});

  return (
    <>
      {selected && (
        <DetailModal
          contact={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <ContactsFilters
        table={table}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <Table
        table={table}
        variant="modern"
        isLoading={isLoading}
        classNames={{
          container: 'border border-muted rounded-md border-t-0',
          rowClassName: 'last:border-0',
        }}
      />

      <TablePagination table={table} className="py-4" />
    </>
  );
}
