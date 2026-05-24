'use client';

import { useState } from 'react';
import { Badge, Button, Flex, Input, Modal, Select, Text } from 'rizzui';
import { PiMagnifyingGlassBold, PiUserPlus } from 'react-icons/pi';
import {
  useEvaluators,
  useEvaluationAssignments,
  useEvaluationStats,
  useCreateAssignment,
} from '@/lib/api/hooks/use-evaluateurs';
import type { Evaluator, EvaluationAssignment } from '@/lib/api/types/evaluateur.types';

type Tab = 'evaluateurs' | 'affectations';

function AddAssignmentModal({ onClose }: { onClose: () => void }) {
  const { data: evaluators = [] } = useEvaluators();
  const { mutate: createAssignment, isPending } = useCreateAssignment();
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [businessPlanId, setBusinessPlanId] = useState('');
  const [deadline, setDeadline] = useState('');

  const options = evaluators
    .filter((e) => e.isActive)
    .map((e) => ({
      value: e.id,
      label: `${e.user.firstName} ${e.user.lastName}${e.expertise ? ` — ${e.expertise}` : ''}`,
    }));

  const handleSubmit = () => {
    if (!evaluatorId || !businessPlanId) return;
    createAssignment(
      { businessPlanId: Number(businessPlanId), evaluatorId, copaEditionId: 1, deadline: deadline || undefined },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="p-6">
        <Text className="mb-1 text-base font-semibold text-gray-800">Nouvelle affectation</Text>
        <Text className="mb-5 text-sm text-gray-500">Affectez un évaluateur à un plan d'affaires.</Text>

        <div className="space-y-4 mb-6">
          <Input
            label="ID du plan d'affaires *"
            type="number"
            placeholder="Ex : 42"
            value={businessPlanId}
            onChange={(e) => setBusinessPlanId(e.target.value)}
          />
          <Select
            label="Évaluateur *"
            placeholder="Choisir un évaluateur..."
            options={options}
            value={options.find((o) => o.value === evaluatorId) ?? null}
            onChange={(opt: any) => setEvaluatorId(opt?.value ?? null)}
            displayValue={(opt: any) => opt?.label ?? ''}
            getOptionValue={(opt: any) => String(opt?.value)}
          />
          <Input
            type="date"
            label="Date limite (optionnel)"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Annuler</Button>
          <Button onClick={handleSubmit} isLoading={isPending} disabled={!evaluatorId || !businessPlanId}>
            Affecter
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const ASSIGNMENT_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'info' }> = {
  PENDING: { label: 'En attente', color: 'warning' },
  IN_PROGRESS: { label: 'En cours', color: 'info' },
  COMPLETED: { label: 'Soumise', color: 'success' },
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function EvaluateursTable() {
  const [tab, setTab] = useState<Tab>('evaluateurs');
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);

  const { data: evaluators = [], isLoading: loadingEval } = useEvaluators();
  const { data: assignments = [], isLoading: loadingAssign } = useEvaluationAssignments();
  const { data: stats } = useEvaluationStats();

  const isLoading = tab === 'evaluateurs' ? loadingEval : loadingAssign;

  const filteredEval = evaluators.filter((e) => {
    if (!search) return true;
    const name = `${e.user?.firstName} ${e.user?.lastName}`;
    return [name, e.user?.email, e.expertise].some((f) => f?.toLowerCase().includes(search.toLowerCase()));
  });

  const filteredAssign = assignments.filter((a) => {
    if (!search) return true;
    const evalName = `${a.evaluator?.user?.firstName} ${a.evaluator?.user?.lastName}`;
    return evalName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Total affectations', value: stats.total ?? 0 },
            { label: 'Évaluations soumises', value: stats.completed ?? 0 },
            { label: 'En attente', value: stats.pending ?? 0 },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {(['evaluateurs', 'affectations'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(''); }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'evaluateurs' ? 'Évaluateurs' : 'Affectations'}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <Flex align="center" justify="between" className="mb-4 gap-3 flex-wrap">
        <Input
          type="search"
          placeholder={tab === 'evaluateurs' ? 'Rechercher un évaluateur...' : 'Rechercher une affectation...'}
          value={search}
          onClear={() => setSearch('')}
          onChange={(e) => setSearch(e.target.value)}
          inputClassName="h-9"
          clearable
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="flex-1 max-w-lg"
        />
        {tab === 'affectations' && (
          <Button size="sm" className="h-9 gap-2" onClick={() => setAddModal(true)}>
            <PiUserPlus className="size-4" />
            Nouvelle affectation
          </Button>
        )}
        <Text className="text-sm text-gray-500">
          {tab === 'evaluateurs' ? filteredEval.length : filteredAssign.length} résultat(s)
        </Text>
      </Flex>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Chargement...</div>
      ) : tab === 'evaluateurs' ? (
        /* ── Évaluateurs ── */
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Évaluateur</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Expertise</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Indépendant</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredEval.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">Aucun évaluateur</td></tr>
              ) : (
                filteredEval.map((evaluator: Evaluator) => (
                  <tr key={evaluator.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {evaluator.user?.firstName} {evaluator.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{evaluator.user?.email}</td>
                    <td className="px-4 py-3 text-gray-600">{evaluator.expertise ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge color={evaluator.isIndependent ? 'success' : 'info'} variant="flat">
                        {evaluator.isIndependent ? 'Oui' : 'Non'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={evaluator.isActive ? 'success' : 'danger'} variant="flat">
                        {evaluator.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Affectations ── */
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Plan d'affaires</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Évaluateur</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Délai</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Affecté le</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssign.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">Aucune affectation</td></tr>
              ) : (
                filteredAssign.map((a: EvaluationAssignment) => {
                  const meta = ASSIGNMENT_STATUS[a.status] ?? { label: a.status, color: 'info' as const };
                  const beneficiaryName = a.businessPlan?.beneficiary?.user
                    ? `${a.businessPlan.beneficiary.user.firstName} ${a.businessPlan.beneficiary.user.lastName}`
                    : `Plan #${a.businessPlanId}`;
                  const evalName = a.evaluator?.user
                    ? `${a.evaluator.user.firstName} ${a.evaluator.user.lastName}`
                    : `Évaluateur #${a.evaluatorId}`;
                  return (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{beneficiaryName}</td>
                      <td className="px-4 py-3 text-gray-700">{evalName}</td>
                      <td className="px-4 py-3 text-gray-500">{fmtDate(a.deadline)}</td>
                      <td className="px-4 py-3">
                        <Badge color={meta.color} variant="flat">{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(a.assignedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {addModal && <AddAssignmentModal onClose={() => setAddModal(false)} />}
    </div>
  );
}
