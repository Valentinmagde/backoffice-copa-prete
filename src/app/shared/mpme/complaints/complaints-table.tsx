'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Badge, Text, Button, Textarea } from 'rizzui';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { useComplaints, useUpdateComplaintStatus } from '@/lib/api/hooks/use-complaints';
import { Complaint } from '@/lib/api/types/complaint.types';
import { complaintsColumns } from './columns';
import ComplaintsFilters, { ComplaintFilters } from './complaints-filters';
import {
  PiWarning, PiShieldWarning, PiHandshake, PiBug, PiQuestion,
  PiCheckCircle, PiXCircle, PiMagnifyingGlass, PiArrowsClockwise,
} from 'react-icons/pi';


// ─── Constantes ───────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'Technical Issue':      { label: 'Problème technique',     icon: <PiBug className="size-3.5" />,          color: 'bg-blue-100 text-blue-700' },
  'Process Irregularity': { label: 'Irrégularité sélection', icon: <PiHandshake className="size-3.5" />,    color: 'bg-orange-100 text-orange-700' },
  'Staff Misconduct':     { label: 'Comportement',           icon: <PiWarning className="size-3.5" />,      color: 'bg-yellow-100 text-yellow-700' },
  'Corruption':           { label: 'Corruption',             icon: <PiShieldWarning className="size-3.5" />, color: 'bg-red-100 text-red-700' },
  'GBV/EAS-HS':           { label: 'VBG / EAS-HS',           icon: <PiShieldWarning className="size-3.5" />, color: 'bg-red-200 text-red-800' },
  'Other':                { label: 'Autre',                  icon: <PiQuestion className="size-3.5" />,     color: 'bg-gray-100 text-gray-600' },
};

const STATUS_META: Record<string, { label: string; variant: any }> = {
  RECEIVED:     { label: 'Reçue',    variant: 'secondary' },
  UNDER_REVIEW: { label: 'En cours', variant: 'warning' },
  RESOLVED:     { label: 'Résolue',  variant: 'success' },
  REJECTED:     { label: 'Rejetée',  variant: 'danger' },
  CLOSED:       { label: 'Clôturée', variant: 'default' },
};

const STATUS_TRANSITIONS: Record<string, { code: string; label: string; icon: React.ReactNode }[]> = {
  RECEIVED:     [{ code: 'UNDER_REVIEW', label: 'Prendre en charge', icon: <PiMagnifyingGlass className="size-4" /> }],
  UNDER_REVIEW: [
    { code: 'RESOLVED', label: 'Résoudre', icon: <PiCheckCircle className="size-4" /> },
    { code: 'REJECTED', label: 'Rejeter',  icon: <PiXCircle className="size-4" /> },
  ],
  RESOLVED: [{ code: 'CLOSED', label: 'Clôturer', icon: <PiArrowsClockwise className="size-4" /> }],
  REJECTED: [{ code: 'CLOSED', label: 'Clôturer', icon: <PiArrowsClockwise className="size-4" /> }],
  CLOSED:   [],
};

// ─── Modal détail ─────────────────────────────────────────────────────────────

function DetailModal({ complaint, onClose }: { complaint: Complaint; onClose: () => void }) {
  const [response, setResponse] = useState(complaint.responseProvided || '');
  const [targetStatus, setTargetStatus] = useState('');
  const { mutate: updateStatus, isPending } = useUpdateComplaintStatus(complaint.id);

  const statusCode = complaint.status?.code || 'RECEIVED';
  const transitions = STATUS_TRANSITIONS[statusCode] || [];
  const typeMeta = TYPE_META[complaint.complaintType?.name] ?? TYPE_META['Other'];
  const statusMeta = STATUS_META[statusCode] ?? { label: statusCode, variant: 'default' };

  const handleAction = (code: string) => {
    setTargetStatus(code);
    if (code === 'UNDER_REVIEW') {
      updateStatus({ statusCode: code });
    }
  };

  const handleSubmitWithResponse = () => {
    updateStatus({ statusCode: targetStatus, response: response || undefined });
    setTargetStatus('');
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
            <Text className="font-bold text-gray-900">{complaint.referenceNumber}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {new Date(complaint.submittedAt).toLocaleString('fr-FR')}
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="flat" color={statusMeta.variant}>{statusMeta.label}</Badge>
            {complaint.generatedVbgAlert && <Badge variant="flat" color="danger">🚨 VBG</Badge>}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-2">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Type */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg w-fit text-sm font-medium ${typeMeta.color}`}>
            {typeMeta.icon} {typeMeta.label}
          </div>

          {/* Identité */}
          {!complaint.isAnonymous && (complaint.fullName || complaint.contactInfo) ? (
            <div className="rounded-lg border border-gray-100 p-4 space-y-1">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Plaignant</Text>
              {complaint.fullName && <Text className="text-sm font-medium text-gray-800">{complaint.fullName}</Text>}
              {complaint.contactInfo && <Text className="text-sm text-gray-500">{complaint.contactInfo}</Text>}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-4">
              <Text className="text-sm text-gray-400 italic">Plainte anonyme</Text>
            </div>
          )}

          {/* Infos contextuelles */}
          {(complaint.incidentDate || complaint.incidentLocation) && (
            <div className="grid grid-cols-2 gap-3">
              {complaint.incidentDate && (
                <div>
                  <Text className="text-xs text-gray-400">Date de l'incident</Text>
                  <Text className="text-sm text-gray-800">
                    {new Date(complaint.incidentDate).toLocaleDateString('fr-FR')}
                  </Text>
                </div>
              )}
              {complaint.incidentLocation && (
                <div>
                  <Text className="text-xs text-gray-400">Lieu</Text>
                  <Text className="text-sm text-gray-800">{complaint.incidentLocation}</Text>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</Text>
            <Text className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </Text>
          </div>

          {/* Réponse existante */}
          {complaint.responseProvided && (
            <div className="rounded-lg bg-green-50 border border-green-100 p-4">
              <Text className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                Réponse apportée
              </Text>
              <Text className="text-sm text-gray-700">{complaint.responseProvided}</Text>
            </div>
          )}

          {/* Actions */}
          {transitions.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</Text>
              {!targetStatus ? (
                <div className="flex gap-2 flex-wrap">
                  {transitions.map(({ code, label, icon }) => (
                    <Button
                      key={code}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAction(code)}
                      isLoading={isPending}
                    >
                      {icon} {label}
                    </Button>
                  ))}
                </div>
              ) : (targetStatus === 'RESOLVED' || targetStatus === 'REJECTED') && (
                <div className="space-y-3">
                  <Textarea
                    label={`Réponse ${targetStatus === 'RESOLVED' ? '(optionnelle)' : '(motif)'}`}
                    placeholder="Saisissez une réponse ou un motif..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitWithResponse} isLoading={isPending}>
                      Confirmer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setTargetStatus('')}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ComplaintsTable({ editionId }: { editionId?: number }) {
  const { data: complaints = [], isLoading } = useComplaints(editionId);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filters, setFilters] = useState<ComplaintFilters>({});

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const q = filters.search?.toLowerCase() ?? '';
      const matchSearch =
        !q ||
        c.referenceNumber.toLowerCase().includes(q) ||
        (c.fullName ?? '').toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      const matchStatus = !filters.status || c.status?.code === filters.status;
      const matchType = !filters.type || c.complaintType?.name === filters.type;
      return matchSearch && matchStatus && matchType;
    });
  }, [complaints, filters]);

  const { table, setData } = useTanStackTable<Complaint>({
    tableData: filtered,
    columnConfig: complaintsColumns(),
    options: {
      meta: { onView: setSelected } as any,
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    setData(filtered);
  }, [filtered]);

  const handleFilterChange = (f: Partial<ComplaintFilters>) => {
    setFilters((prev) => ({ ...prev, ...f }));
  };

  const handleResetFilters = () => setFilters({});

  return (
    <>
      {selected && <DetailModal complaint={selected} onClose={() => setSelected(null)} />}

      <ComplaintsFilters
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
