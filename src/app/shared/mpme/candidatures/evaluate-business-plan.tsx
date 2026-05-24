'use client';

import { useState } from 'react';
import { Badge, Button, Modal, Text, Textarea, Input, Select, Loader } from 'rizzui';
import { PiClipboardText, PiStar, PiUserPlus, PiWarning } from 'react-icons/pi';
import {
  useAssignmentsByBusinessPlan,
  useEvaluationsByBusinessPlan,
  useSubmitEvaluation,
  useCreateAssignment,
  useEvaluators,
} from '@/lib/api/hooks/use-evaluateurs';
import { useBusinessPlanByBeneficiary } from '@/lib/api/hooks/use-business-plan';
import type { Evaluation, EvaluationAssignment, EvaluationInput } from '@/lib/api/types/evaluateur.types';
import { SCORE_CRITERIA as CRITERIA } from '@/lib/api/types/evaluateur.types';

const ASSIGNMENT_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'info' }> = {
  PENDING:     { label: 'En attente', color: 'warning' },
  IN_PROGRESS: { label: 'En cours',   color: 'info' },
  COMPLETED:   { label: 'Soumise',    color: 'success' },
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtAmount = (n?: number | null) =>
  n ? `${Number(n).toLocaleString('fr-FR')} BIF` : '—';

function ScoreBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-sm font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function ScoreInput({ label, description, value, onChange }: {
  label: string; description: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <span className="ml-2 text-xs text-gray-400">{description}</span>
        </div>
        <span className="text-sm font-bold text-gray-700">{value}/100</span>
      </div>
      <input
        type="range" min={0} max={100} step={5} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-500"
      />
      <div className="flex justify-between text-xs text-gray-300 mt-0.5">
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}

function EvaluationFormModal({ assignment, businessPlanId, onClose }: {
  assignment: EvaluationAssignment; businessPlanId: number; onClose: () => void;
}) {
  const { mutate: submit, isPending } = useSubmitEvaluation(businessPlanId);
  const defaultScores = Object.fromEntries(CRITERIA.map((c) => [c.key, 50])) as Record<string, number>;
  const [scores, setScores] = useState(defaultScores);
  const [recommendation, setRecommendation] = useState('');
  const [isFinal, setIsFinal] = useState(false);

  const total = Math.round(CRITERIA.reduce((sum, c) => sum + scores[c.key as string], 0) / CRITERIA.length);

  const handleSubmit = () => {
    const payload: EvaluationInput = {
      assignmentId: assignment.id,
      economicViabilityScore:      scores.economicViabilityScore,
      innovationScore:             scores.innovationScore,
      qualityScore:                scores.qualityScore,
      implementationCapacityScore: scores.implementationCapacityScore,
      socialImpactScore:           scores.socialImpactScore,
      environmentalImpactScore:    scores.environmentalImpactScore,
      recommendation,
      isFinalEvaluation: isFinal,
    };
    submit(payload, { onSuccess: onClose });
  };

  const evalName = `${assignment.evaluator?.user?.firstName ?? ''} ${assignment.evaluator?.user?.lastName ?? ''}`.trim();

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <div className="p-6">
        <Text className="mb-1 text-base font-semibold text-gray-800">Saisir une évaluation</Text>
        <Text className="mb-5 text-sm text-gray-500">
          Affectation #{assignment.id} — Évaluateur : <span className="font-medium text-gray-700">{evalName}</span>
        </Text>

        <div className="mb-6 space-y-5">
          {CRITERIA.map((c) => (
            <ScoreInput
              key={c.key as string}
              label={c.label}
              description={c.description}
              value={scores[c.key as string]}
              onChange={(v) => setScores((prev) => ({ ...prev, [c.key as string]: v }))}
            />
          ))}
        </div>

        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
          <Text className="text-sm font-medium text-gray-600">Score total moyen</Text>
          <span className={`text-2xl font-bold ${total >= 70 ? 'text-green-600' : total >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
            {total}/100
          </span>
        </div>

        <Textarea
          label="Recommandation *"
          placeholder="Rédigez votre recommandation détaillée sur ce plan d'affaires..."
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          rows={4}
          className="mb-4"
        />

        <label className="mb-6 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox" checked={isFinal}
            onChange={(e) => setIsFinal(e.target.checked)}
            className="rounded border-gray-300 accent-primary-500"
          />
          <Text className="text-sm text-gray-700">Marquer comme évaluation finale</Text>
        </label>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Annuler</Button>
          <Button onClick={handleSubmit} isLoading={isPending} disabled={!recommendation.trim()}>
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
  const { data: businessPlan, isLoading: loadingBP } = useBusinessPlanByBeneficiary(beneficiaryId);

  const businessPlanId = businessPlan?.id ?? null;
  const copaEditionId = businessPlan?.copaEdition?.id ?? 1;

  const { data: assignments = [], isLoading: loadingA } = useAssignmentsByBusinessPlan(businessPlanId);
  const { data: evaluations = [], isLoading: loadingE } = useEvaluationsByBusinessPlan(businessPlanId);

  const [assignModal, setAssignModal] = useState(false);
  const [evalModal, setEvalModal] = useState<EvaluationAssignment | null>(null);

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
              const scoreColor = ev.totalScore >= 70 ? 'text-green-600' : ev.totalScore >= 40 ? 'text-amber-500' : 'text-red-500';
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
                      <span className={`text-xl font-bold ${scoreColor}`}>{ev.totalScore}/100</span>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2">
                    {CRITERIA.map((c) => (
                      <div key={c.key as string}>
                        <p className="mb-0.5 text-xs text-gray-500">{c.label}</p>
                        <ScoreBar value={(ev as any)[c.key as string] ?? 0} />
                      </div>
                    ))}
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
