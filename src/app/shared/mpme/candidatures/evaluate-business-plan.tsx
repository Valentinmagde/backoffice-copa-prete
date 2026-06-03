'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Badge, Button, Modal, Text, Textarea, Input, Select, Loader } from 'rizzui';
import { PiClipboardText, PiStar, PiUserPlus, PiWarning } from 'react-icons/pi';
import { businessPlanApi } from '@/lib/api/endpoints/business-plan.api';
import {
  useAssignmentsByBusinessPlan,
  useEvaluationsByBusinessPlan,
  useSubmitEvaluation,
  useCreateAssignment,
  useEvaluators,
} from '@/lib/api/hooks/use-evaluateurs';
import { useBusinessPlanByBeneficiary } from '@/lib/api/hooks/use-business-plan';
import type { Evaluation, EvaluationAssignment, EvaluationInput } from '@/lib/api/types/evaluateur.types';
import { SCORE_CRITERIA as CRITERIA, SCORE_LABELS, TOTAL_MAX, RECOMMENDATION_OPTIONS } from '@/lib/api/types/evaluateur.types';

const ASSIGNMENT_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'info' }> = {
  PENDING:     { label: 'En attente', color: 'warning' },
  IN_PROGRESS: { label: 'En cours',   color: 'info' },
  COMPLETED:   { label: 'Soumise',    color: 'success' },
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtAmount = (n?: number | null) =>
  n != null ? `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BIF` : '—';

const fmtUSD = (n?: number | null) =>
  n != null ? `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : '—';

function ScoreBar({ value, max = TOTAL_MAX }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-right text-sm font-semibold text-gray-700">{value}/{max}</span>
    </div>
  );
}

function CriterionInput({ num, label, coefficient, value, onChange }: {
  num: number; label: string; coefficient: number; value: number; onChange: (v: number) => void;
}) {
  const weighted = value * coefficient;
  const maxWeighted = 5 * coefficient;
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">{num}</span>
          <span className="text-sm text-gray-700 leading-snug">{label}</span>
        </div>
        <span className="shrink-0 text-xs font-medium text-gray-400">×{coefficient}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition-all ${
              value === v
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-500'
            }`}
            title={SCORE_LABELS[v]}
          >
            {v}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {SCORE_LABELS[value]} · <span className="font-medium text-gray-600">{weighted}/{maxWeighted} pts</span>
        </span>
      </div>
    </div>
  );
}

function EvaluationFormModal({ assignment, businessPlanId, onClose }: {
  assignment: EvaluationAssignment; businessPlanId: number; onClose: () => void;
}) {
  const { mutate: submit, isPending } = useSubmitEvaluation(businessPlanId);
  const defaultScores = Object.fromEntries(CRITERIA.map((c) => [c.key, 0])) as Record<string, number>;
  const [scores, setScores] = useState(defaultScores);
  const [recommendation, setRecommendation] = useState<string>('');
  const [globalComment, setGlobalComment] = useState('');
  const [conflictOfInterest, setConflictOfInterest] = useState(false);

  const total = CRITERIA.reduce((sum, c) => sum + (scores[c.key as string] ?? 0) * c.coefficient, 0);
  const totalPct = Math.round((total / TOTAL_MAX) * 100);
  const scoreColor = totalPct >= 70 ? 'text-green-600' : totalPct >= 40 ? 'text-amber-500' : 'text-red-500';

  const sections = Array.from(new Set(CRITERIA.map((c) => c.section)));

  const handleSubmit = () => {
    const payload: EvaluationInput = {
      businessPlanId,
      ...(Object.fromEntries(CRITERIA.map((c) => [c.key, scores[c.key as string] ?? 0])) as any),
      recommendation: recommendation as any,
      conflictOfInterestDeclared: conflictOfInterest,
      globalComment: globalComment || undefined,
    };
    submit(payload, { onSuccess: onClose });
  };

  const evalName = `${assignment.evaluator?.user?.firstName ?? ''} ${assignment.evaluator?.user?.lastName ?? ''}`.trim();

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <div className="max-h-[90vh] overflow-y-auto p-6">
        <Text className="mb-1 text-base font-semibold text-gray-800">Grille d'évaluation — COPA Nyunganira</Text>
        <Text className="mb-5 text-sm text-gray-500">
          Affectation #{assignment.id} · Évaluateur : <span className="font-medium text-gray-700">{evalName}</span>
        </Text>

        <div className="mb-6 space-y-5">
          {sections.map((section) => {
            const criteria = CRITERIA.filter((c) => c.section === section);
            const sectionTotal = criteria.reduce((s, c) => s + (scores[c.key as string] ?? 0) * c.coefficient, 0);
            const sectionMax = criteria.reduce((s, c) => s + 5 * c.coefficient, 0);
            return (
              <div key={section}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600">{section}</h3>
                  <span className="text-xs font-medium text-gray-500">{sectionTotal}/{sectionMax} pts</span>
                </div>
                <div className="space-y-2">
                  {criteria.map((c) => (
                    <CriterionInput
                      key={c.key as string}
                      num={c.num}
                      label={c.label}
                      coefficient={c.coefficient}
                      value={scores[c.key as string] ?? 0}
                      onChange={(v) => setScores((prev) => ({ ...prev, [c.key as string]: v }))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
          <div>
            <Text className="text-sm font-medium text-gray-600">Score total pondéré</Text>
            <Text className="text-xs text-gray-400">Échelle : 5=Excellent · 4=Bien · 3=Assez bien · 2=Faible · 1=Très faible · 0=Nul</Text>
          </div>
          <span className={`text-2xl font-bold ${scoreColor}`}>{total}/{TOTAL_MAX}</span>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Recommandation *</label>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRecommendation(opt.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  recommendation === opt.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Commentaire général (optionnel)"
          placeholder="Observations complémentaires sur ce plan d'affaires..."
          value={globalComment}
          onChange={(e) => setGlobalComment(e.target.value)}
          rows={3}
          className="mb-4"
        />

        <label className="mb-6 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox" checked={conflictOfInterest}
            onChange={(e) => setConflictOfInterest(e.target.checked)}
            className="rounded border-gray-300 accent-primary-500"
          />
          <Text className="text-sm text-gray-700">Je déclare ne pas avoir de conflit d'intérêt avec ce dossier</Text>
        </label>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Annuler</Button>
          <Button onClick={handleSubmit} isLoading={isPending} disabled={!recommendation}>
            Soumettre l'évaluation
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AssignModal({ businessPlanId, copaEditionId, onClose }: {
  businessPlanId: number; copaEditionId: number; onClose: () => void;
}) {
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);
  const [deadline, setDeadline] = useState('');
  const { data: evaluators = [] } = useEvaluators();
  const { mutate: createAssignment, isPending } = useCreateAssignment();

  const options = evaluators
    .filter((e) => e.isActive)
    .map((e) => ({
      value: e.id,
      label: `${e.user.firstName} ${e.user.lastName}${e.expertise ? ` — ${e.expertise}` : ''}`,
    }));

  const handleSubmit = () => {
    if (!evaluatorId) return;
    createAssignment(
      { businessPlanId, evaluatorId, copaEditionId, deadline: deadline || undefined },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="p-6">
        <Text className="mb-1 text-base font-semibold text-gray-800">Affecter un évaluateur</Text>
        <Text className="mb-5 text-sm text-gray-500">Choisissez l'évaluateur et la date limite.</Text>

        <div className="space-y-4 mb-6">
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
          <Button onClick={handleSubmit} isLoading={isPending} disabled={!evaluatorId}>Affecter</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function EvaluateBusinessPlan({ beneficiaryId, beneficiaryName }: {
  beneficiaryId: number; beneficiaryName: string;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
  const isAdmin = (session?.user as any)?.roles?.some((r: string) =>
    ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'].includes(r)
  ) ?? false;

  const { data: businessPlan, isLoading: loadingBP } = useBusinessPlanByBeneficiary(beneficiaryId);

  const businessPlanId = businessPlan?.id ?? null;
  const copaEditionId = businessPlan?.copaEdition?.id ?? 1;

  const { data: assignments = [], isLoading: loadingA } = useAssignmentsByBusinessPlan(businessPlanId);
  const { data: evaluations = [], isLoading: loadingE } = useEvaluationsByBusinessPlan(businessPlanId);

  const [assignModal, setAssignModal] = useState(false);
  const [evalModal, setEvalModal] = useState<EvaluationAssignment | null>(null);

  const [financialEdit, setFinancialEdit] = useState<{
    verifiedFundingAmount: string;
    verifiedTotalProjectCost: string;
  } | null>(null);
  const [financialSaving, setFinancialSaving] = useState(false);
  const [financialError, setFinancialError] = useState<string | null>(null);

  if (loadingBP) {
    return <div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>;
  }

  if (!businessPlan) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <PiWarning className="mb-3 size-10 text-amber-400" />
        <Text className="text-base font-medium text-gray-700">Aucun plan d'affaires trouvé</Text>
        <Text className="mt-1 text-sm text-gray-400">
          Ce bénéficiaire n'a pas encore soumis de plan d'affaires.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Résumé du plan d'affaires ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Plan d'affaires</p>
            <h2 className="mt-0.5 text-base font-bold text-gray-900">{businessPlan.projectTitle}</h2>
            {businessPlan.referenceNumber && (
              <p className="text-xs text-gray-400">Réf. {businessPlan.referenceNumber}</p>
            )}
          </div>
          {businessPlan.status && (
            <Badge variant="flat" color={businessPlan.status.code === 'SUBMITTED' ? 'success' : 'warning'}>
              {businessPlan.status.name}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            { label: 'Secteur',         value: businessPlan.businessSector?.name },
            { label: 'Financement demandé', value: fmtAmount(businessPlan.requestedFundingAmount) },
            { label: 'Apport personnel', value: fmtAmount(businessPlan.personalContributionAmount) },
            { label: 'Emplois prévus',  value: businessPlan.expectedJobsCount ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-800">{value ?? '—'}</p>
            </div>
          ))}
        </div>

        {businessPlan.projectDescription && (
          <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
            <p className="text-sm text-gray-700">{businessPlan.projectDescription}</p>
          </div>
        )}

        {businessPlan.sections && businessPlan.sections.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sections</p>
            {businessPlan.sections.map((s) => (
              <div key={s.id} className="rounded-lg border border-gray-100 p-3">
                <p className="mb-1 text-xs font-semibold text-gray-500">{s.sectionType?.name ?? `Section ${s.sectionOrder}`}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.content ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Données financières vérifiées ── */}
      {(() => {
        if (!businessPlan) return null;
        const lockedByMe = businessPlan.financialDataEvaluatorId === currentUserId;
        const lockedByOther = businessPlan.financialDataEvaluatorId !== null && !lockedByMe;
        const canEdit = isAdmin || !lockedByOther;

        const handleSave = async () => {
          if (!financialEdit || !businessPlan.id) return;
          setFinancialSaving(true);
          setFinancialError(null);
          try {
            const payload: { verifiedFundingAmount?: number; verifiedTotalProjectCost?: number } = {};
            const funding = parseFloat(financialEdit.verifiedFundingAmount.replace(/\s/g, '').replace(',', '.'));
            const cost = parseFloat(financialEdit.verifiedTotalProjectCost.replace(/\s/g, '').replace(',', '.'));
            if (!isNaN(funding)) payload.verifiedFundingAmount = funding;
            if (!isNaN(cost)) payload.verifiedTotalProjectCost = cost;
            await businessPlanApi.updateFinancialData(businessPlan.id, payload);
            await queryClient.invalidateQueries({ queryKey: ['business-plan', 'beneficiary', beneficiaryId] });
            setFinancialEdit(null);
          } catch {
            setFinancialError('Erreur lors de la sauvegarde. Veuillez réessayer.');
          } finally {
            setFinancialSaving(false);
          }
        };

        return (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                Données financières vérifiées
              </p>
              {lockedByOther && (
                <span className="text-xs text-gray-400">Saisi par un autre évaluateur</span>
              )}
              {lockedByMe && !financialEdit && (
                <span className="text-xs text-green-600 font-medium">Saisi par vous</span>
              )}
            </div>

            {financialEdit ? (
              <div className="space-y-3">
                <Input
                  label="Subvention demandée (USD)"
                  value={financialEdit.verifiedFundingAmount}
                  onChange={(e) => setFinancialEdit({ ...financialEdit, verifiedFundingAmount: e.target.value })}
                  placeholder="Ex : 5000000"
                  type="number"
                  min={0}
                />
                <Input
                  label="Coût total du projet (USD)"
                  value={financialEdit.verifiedTotalProjectCost}
                  onChange={(e) => setFinancialEdit({ ...financialEdit, verifiedTotalProjectCost: e.target.value })}
                  placeholder="Ex : 8000000"
                  type="number"
                  min={0}
                />
                {financialError && (
                  <p className="text-xs text-red-500">{financialError}</p>
                )}
                <div className="flex gap-2 justify-end pt-1">
                  <Button variant="outline" size="sm" onClick={() => { setFinancialEdit(null); setFinancialError(null); }} disabled={financialSaving}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSave} isLoading={financialSaving}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Subvention demandée</p>
                  <p className="font-medium text-gray-800">
                    {businessPlan.verifiedFundingAmount != null ? fmtUSD(businessPlan.verifiedFundingAmount) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Coût total du projet</p>
                  <p className="font-medium text-gray-800">
                    {businessPlan.verifiedTotalProjectCost != null ? fmtUSD(businessPlan.verifiedTotalProjectCost) : '—'}
                  </p>
                </div>
              </div>
            )}

            {canEdit && !financialEdit && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFinancialEdit({
                    verifiedFundingAmount: businessPlan.verifiedFundingAmount?.toString() ?? '',
                    verifiedTotalProjectCost: businessPlan.verifiedTotalProjectCost?.toString() ?? '',
                  })}
                >
                  {businessPlan.financialDataEvaluatorId ? 'Modifier' : 'Saisir'}
                </Button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Affectations ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Text className="text-base font-semibold text-gray-800">
            Affectations ({loadingA ? '…' : assignments.length})
          </Text>
          <Button size="sm" className="gap-2" onClick={() => setAssignModal(true)}>
            <PiUserPlus className="size-4" />
            Affecter un évaluateur
          </Button>
        </div>

        {loadingA ? (
          <div className="py-8 text-center text-sm text-gray-400">Chargement...</div>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            Aucun évaluateur affecté à ce plan d'affaires
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Évaluateur</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Date limite</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Affecté le</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a: EvaluationAssignment) => {
                  const meta = ASSIGNMENT_STATUS[a.status] ?? { label: a.status, color: 'info' as const };
                  const evalName = a.evaluator?.user
                    ? `${a.evaluator.user.firstName} ${a.evaluator.user.lastName}`
                    : `#${a.evaluatorId}`;
                  return (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{evalName}</td>
                      <td className="px-4 py-3 text-gray-500">{fmtDate(a.deadline)}</td>
                      <td className="px-4 py-3"><Badge color={meta.color} variant="flat">{meta.label}</Badge></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(a.assignedAt)}</td>
                      <td className="px-4 py-3">
                        {a.status !== 'COMPLETED' && (
                          <Button size="sm" variant="outline" onClick={() => setEvalModal(a)}>
                            Saisir l'évaluation
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Évaluations soumises ── */}
      <div>
        <Text className="mb-3 text-base font-semibold text-gray-800">
          Évaluations soumises ({loadingE ? '…' : evaluations.length})
        </Text>

        {loadingE ? (
          <div className="py-8 text-center text-sm text-gray-400">Chargement...</div>
        ) : evaluations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            Aucune évaluation soumise pour le moment
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((ev: Evaluation) => {
              const evalName = ev.evaluator?.user
                ? `${ev.evaluator.user.firstName} ${ev.evaluator.user.lastName}`
                : `Évaluateur #${ev.evaluatorId}`;
              const evTotal = CRITERIA.reduce((sum, c) => sum + ((ev as any)[c.key as string] ?? 0) * c.coefficient, 0);
              const scoreColor = evTotal >= 70 ? 'text-green-600' : evTotal >= 40 ? 'text-amber-500' : 'text-red-500';
              return (
                <div key={ev.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary-50 p-1.5">
                        <PiClipboardText className="size-4 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{evalName}</p>
                        <p className="text-xs text-gray-400">{fmtDate(ev.evaluationDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ev.isFinalEvaluation && (
                        <Badge color="success" variant="flat" className="gap-1">
                          <PiStar className="size-3" /> Finale
                        </Badge>
                      )}
                      <span className={`text-xl font-bold ${scoreColor}`}>{evTotal}/{TOTAL_MAX}</span>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1">
                    {CRITERIA.map((c) => {
                      const score = (ev as any)[c.key as string] ?? 0;
                      const weighted = score * c.coefficient;
                      const maxWeighted = 5 * c.coefficient;
                      return (
                        <div key={c.key as string} className="flex items-center gap-2">
                          <span className="w-4 text-right text-xs font-semibold text-gray-400">{c.num}.</span>
                          <span className="min-w-0 flex-1 truncate text-xs text-gray-600">{c.label}</span>
                          <span className="shrink-0 text-xs font-medium text-gray-700">{score}/5</span>
                          <span className="w-14 shrink-0 text-right text-xs text-gray-400">{weighted}/{maxWeighted} pts</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Recommandation</p>
                    <p className="text-sm text-gray-700">{ev.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {assignModal && businessPlanId && (
        <AssignModal
          businessPlanId={businessPlanId}
          copaEditionId={copaEditionId}
          onClose={() => setAssignModal(false)}
        />
      )}
      {evalModal && businessPlanId && (
        <EvaluationFormModal
          assignment={evalModal}
          businessPlanId={businessPlanId}
          onClose={() => setEvalModal(null)}
        />
      )}
    </div>
  );
}
