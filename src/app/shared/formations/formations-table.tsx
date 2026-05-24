'use client';

import { useState } from 'react';
import { Badge, Button, Flex, Input, Text } from 'rizzui';
import { PiMagnifyingGlassBold, PiCheckCircle, PiClock, PiMapPin } from 'react-icons/pi';
import { useTrainingSessions, useUpdateSessionStatus } from '@/lib/api/hooks/use-training';
import type { TrainingSession } from '@/lib/api/types/training.types';

const STATUS_META: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'danger' }> = {
  PLANNED: { label: 'Planifiée', color: 'info' },
  OPEN: { label: 'Inscriptions ouvertes', color: 'success' },
  IN_PROGRESS: { label: 'En cours', color: 'warning' },
  COMPLETED: { label: 'Terminée', color: 'success' },
  CANCELLED: { label: 'Annulée', color: 'danger' },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function FormationsTable() {
  const { data: sessions = [], isLoading } = useTrainingSessions();
  const updateStatus = useUpdateSessionStatus();
  const [search, setSearch] = useState('');

  const filtered = sessions.filter((s) => {
    if (!search) return true;
    return [s.training?.title, s.physicalLocation, s.sessionCode].some(
      (f) => f?.toLowerCase().includes(search.toLowerCase()),
    );
  });

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">Chargement des sessions...</div>;
  }

  return (
    <div>
      {/* Barre recherche */}
      <Flex align="center" justify="between" className="mb-4 gap-3 flex-wrap">
        <Input
          type="search"
          placeholder="Rechercher par formation, lieu, code..."
          value={search}
          onClear={() => setSearch('')}
          onChange={(e) => setSearch(e.target.value)}
          inputClassName="h-9"
          clearable
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="flex-1 max-w-lg"
        />
        <Text className="text-sm text-gray-500">{filtered.length} session(s)</Text>
      </Flex>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Formation</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Dates</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Lieu</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Participants</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Statut</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  Aucune session trouvée
                </td>
              </tr>
            ) : (
              filtered.map((session: TrainingSession) => {
                const meta = STATUS_META[session.status] ?? { label: session.status, color: 'info' as const };
                const fill = session.maxCapacity
                  ? Math.round((session.currentEnrollment / session.maxCapacity) * 100)
                  : null;
                return (
                  <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{session.training?.title ?? '—'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{session.sessionCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-700">
                        <PiClock className="size-3.5 text-gray-400" />
                        {fmtDate(session.startDate)}
                      </div>
                      {session.startDate !== session.endDate && (
                        <div className="text-xs text-gray-400 mt-0.5">→ {fmtDate(session.endDate)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {session.physicalLocation ? (
                        <div className="flex items-center gap-1 text-gray-700">
                          <PiMapPin className="size-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{session.physicalLocation}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {session.currentEnrollment}
                        {session.maxCapacity && (
                          <span className="text-gray-400 font-normal"> / {session.maxCapacity}</span>
                        )}
                      </div>
                      {fill !== null && (
                        <div className="mt-1 h-1.5 w-20 rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(fill, 100)}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={meta.color} variant="flat" className="text-xs">
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Flex gap="2">
                        {session.status === 'PLANNED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => updateStatus.mutate({ sessionId: session.id, status: 'OPEN' })}
                            isLoading={updateStatus.isPending}
                          >
                            Ouvrir inscriptions
                          </Button>
                        )}
                        {session.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="flat"
                            className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100"
                            onClick={() => updateStatus.mutate({ sessionId: session.id, status: 'COMPLETED' })}
                            isLoading={updateStatus.isPending}
                          >
                            <PiCheckCircle className="mr-1 size-3.5" />
                            Clôturer
                          </Button>
                        )}
                      </Flex>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
