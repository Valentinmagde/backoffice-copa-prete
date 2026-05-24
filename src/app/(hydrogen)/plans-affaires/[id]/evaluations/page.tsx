'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader, Button, Modal, Select, Text, Textarea } from 'rizzui';
import { PiClipboardText } from 'react-icons/pi';
import FormGroup from '@/app/shared/form-group';
import { routes } from '@/config/routes';
import { useEvaluationsByBusinessPlan, useSubmitEvaluation } from '@/lib/api/hooks/use-evaluateurs';
import type { Evaluation, EvaluationInput, RecommendationCode } from '@/lib/api/types/evaluateur.types';
import { SCORE_CRITERIA as CRITERIA } from '@/lib/api/types/evaluateur.types';

const RECOMMENDATION_OPTIONS: { value: RecommendationCode; label: string }[] = [
  { value: 'STRONGLY_RECOMMENDED',      label: 'Fortement recommandé' },
  { value: 'RECOMMENDED',               label: 'Recommandé' },
  { value: 'RECOMMENDED_WITH_RESERVES', label: 'Recommandé avec réserves' },
  { value: 'NOT_RECOMMENDED',           label: 'Non recommandé' },
];

const RECOMMENDATION_LABELS: Record<string, string> = {
  STRONGLY_RECOMMENDED:      'Fortement recommandé',
  RECOMMENDED:               'Recommandé',
  RECOMMENDED_WITH_RESERVES: 'Recommandé avec réserves',
  NOT_RECOMMENDED:           'Non recommandé',
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-sm font-semibold text-gray-700">{value}/{max}</span>
    </div>
  );
}

function EvaluationFormModal({ businessPlanId, onClose }: { businessPlanId: number; onClose: () => void }) {
  const { mutate: submit, isPending } = useSubmitEvaluation(businessPlanId);
  const defaultScores = Object.fromEntries(CRITERIA.map((c) => [c.key, 0])) as Record<string, number>;
  const [scores, setScores] = useState(defaultScores);
  const [recommendation, setRecommendation] = useState<RecommendationCode | null>(null);
  const [globalComment, setGlobalComment] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [conflictOfInterest, setConflictOfInterest] = useState(false);

  const total = CRITERIA.reduce((sum, c) => sum + scores[c.key as string], 0);
  const maxTotal = CRITERIA.reduce((sum, c) => sum + c.max, 0);
  const totalPct = Math.round((total / maxTotal) * 100);

  const handleSubmit = () => {
    if (!recommendation) return;
    const payload: EvaluationInput = {
      businessPlanId,
      economicViabilityScore:      scores.economicViabilityScore,
      innovationScore:             scores.innovationScore,
      qualityScore:                scores.qualityScore,
      implementationCapacityScore: scores.implementationCapacityScore,
      socialImpactScore:           scores.socialImpactScore,
      environmentalImpactScore:    scores.environmentalImpactScore,
      recommendation,
      conflictOfInterestDeclared: conflictOfInterest,
      globalComment: globalComment || undefined,
      strengths:     strengths || undefined,
      weaknesses:    weaknesses || undefined,
    };
    submit(payload, { onSuccess: onClose });
  };

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="p-6">
        <Text className="mb-1 text-base font-semibold text-gray-800">Évaluer ce plan d'affaires</Text>
        <Text className="mb-5 text-sm text-gray-500">Notez chaque critère selon le barème indiqué.</Text>

        <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key as string} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 leading-tight">{c.label}</p>
                <p className="text-xs text-gray-400">{c.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={c.max}
                  value={scores[c.key as string]}
                  onChange={(e) => {
                    const v = Math.min(c.max, Math.max(0, Number(e.target.value)));
                    setScores((prev) => ({ ...prev, [c.key as string]: v }));
                  }}
                  className="w-14 rounded border border-gray-300 px-2 py-1.5 text-center text-sm font-semibold focus:border-primary-400 focus:outline-none"
                />
                <span className="text-xs text-gray-400">/{c.max}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
          <Text className="text-sm font-medium text-gray-600">Score total</Text>
          <span className={`text-xl font-bold ${totalPct >= 70 ? 'text-green-600' : totalPct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
            {total}/{maxTotal}
          </span>
        </div>

        <div className="space-y-3 mb-5">
          <Select
            label="Recommandation *"
            placeholder="Choisir une recommandation..."
            options={RECOMMENDATION_OPTIONS}
            value={RECOMMENDATION_OPTIONS.find((o) => o.value === recommendation) ?? null}
            onChange={(opt: any) => setRecommendation(opt?.value ?? null)}
            displayValue={(opt: any) => opt?.label ?? ''}
            getOptionValue={(opt: any) => opt?.value ?? ''}
          />
          <div className="grid grid-cols-2 gap-3">
            <Textarea label="Points forts" placeholder="Atouts du projet..." value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2} />
            <Textarea label="Points faibles" placeholder="Faiblesses identifiées..." value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} rows={2} />
          </div>
          <Textarea label="Commentaire général" placeholder="Observations générales..." value={globalComment} onChange={(e) => setGlobalComment(e.target.value)} rows={2} />
        </div>

        <label className="mb-5 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={conflictOfInterest} onChange={(e) => setConflictOfInterest(e.target.checked)} className="rounded border-gray-300" />
          <Text className="text-sm text-gray-700">Je déclare n'avoir aucun conflit d'intérêt avec ce plan</Text>
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

function EvaluationsContent({ businessPlanId, id }: { businessPlanId: number; id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: evaluations = [], isLoading } = useEvaluationsByBusinessPlan(businessPlanId);
  const [evalModal, setEvalModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('open') === '1') {
      setEvalModal(true);
      router.replace(routes.businessPlans.evaluations(id));
    }
  }, [searchParams]);

  const maxTotal = CRITERIA.reduce((sum, c) => sum + c.max, 0);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>;
  }

  return (
    <>
      <FormGroup
        title={`Évaluations (${evaluations.length})`}
        description="Évaluations soumises par les évaluateurs pour ce plan d'affaires"
        className="@3xl:grid-cols-12"
      >
        <div className="space-y-3 @3xl:col-span-8">
          {evaluations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              Aucune évaluation soumise pour le moment
            </div>
          ) : (
            evaluations.map((ev: Evaluation) => {
              const evalName = ev.evaluator?.user
                ? `${ev.evaluator.user.firstName} ${ev.evaluator.user.lastName}`
                : `Évaluateur #${ev.evaluatorId}`;
              const totalPct = Math.round((ev.totalScore / maxTotal) * 100);
              const scoreColor = totalPct >= 70 ? 'text-green-600' : totalPct >= 40 ? 'text-amber-500' : 'text-red-500';
              return (
                <div key={ev.id} className="rounded-lg border border-muted bg-white p-6">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary-50 p-1.5">
                        <PiClipboardText className="size-4 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{evalName}</p>
                        <p className="text-xs text-gray-400">{fmtDate(ev.evaluationDate)}</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${scoreColor}`}>{ev.totalScore}/{maxTotal}</span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2">
                    {CRITERIA.map((c) => (
                      <div key={c.key as string}>
                        <p className="mb-0.5 text-xs text-gray-400">{c.label}</p>
                        <ScoreBar value={(ev as any)[c.key as string] ?? 0} max={c.max} />
                      </div>
                    ))}
                  </div>

                  {ev.recommendation && (
                    <div className="mb-3 rounded-lg bg-blue-50 px-3 py-2.5">
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Recommandation</p>
                      <p className="text-sm font-medium text-blue-700">
                        {RECOMMENDATION_LABELS[ev.recommendation] ?? ev.recommendation}
                      </p>
                    </div>
                  )}

                  {(ev.strengths || ev.weaknesses) && (
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      {ev.strengths && (
                        <div className="rounded-lg bg-green-50 px-3 py-2.5">
                          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Points forts</p>
                          <p className="text-sm text-gray-700">{ev.strengths}</p>
                        </div>
                      )}
                      {ev.weaknesses && (
                        <div className="rounded-lg bg-red-50 px-3 py-2.5">
                          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Points faibles</p>
                          <p className="text-sm text-gray-700">{ev.weaknesses}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {ev.globalComment && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Commentaire</p>
                      <p className="text-sm text-gray-700">{ev.globalComment}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </FormGroup>

      {evalModal && (
        <EvaluationFormModal
          businessPlanId={businessPlanId}
          onClose={() => setEvalModal(false)}
        />
      )}
    </>
  );
}

export default function BusinessPlanEvaluationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="@container space-y-8">
      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>}>
        <EvaluationsContent businessPlanId={Number(id)} id={id} />
      </Suspense>
    </div>
  );
}
