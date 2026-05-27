'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, Text, Textarea, Loader } from 'rizzui';
import { PiCheckCircle, PiWarning } from 'react-icons/pi';
import { useBusinessPlanById } from '@/lib/api/hooks/use-business-plan';
import {
  useEvaluationGaps,
  useMyEvaluations,
  useSubmitEvaluation,
  useUpdateEvaluation,
} from '@/lib/api/hooks/use-evaluateurs';
import {
  SCORE_CRITERIA as CRITERIA,
  SCORE_LABELS,
  TOTAL_MAX,
} from '@/lib/api/types/evaluateur.types';
import type { EvaluationInput } from '@/lib/api/types/evaluateur.types';
import { routes } from '@/config/routes';

const fmtAmount = (n?: number | null) =>
  n != null ? `${Number(n).toLocaleString('fr-FR')} BIF` : '—';

const STATUS_LABELS: Record<string, string> = {
  DRAFT:            'Brouillon',
  SUBMITTED:        'Soumis',
  UNDER_EVALUATION: "En cours d'évaluation",
  EVALUATED:        'Évalué',
  SELECTED:         'Sélectionné',
  REJECTED:         'Rejeté',
};

function CriterionInput({
  num, label, coefficient, value, hasGap, comment, touched, binaryOnly, onChange, onCommentChange,
}: {
  num: number; label: string; coefficient: number; value: number;
  hasGap: boolean; comment: string; touched: boolean; binaryOnly?: boolean;
  onChange: (v: number) => void; onCommentChange: (c: string) => void;
}) {
  const allowedValues = binaryOnly ? [0, 5] : [0, 1, 2, 3, 4, 5];
  return (
    <div className={`rounded-lg border px-5 py-4 transition-colors ${
      hasGap ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50'
    }`}>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          hasGap ? 'bg-amber-200 text-amber-700' : 'bg-primary-100 text-primary-600'
        }`}>
          {num}
        </span>
        <span className="flex-1 text-sm leading-snug text-gray-700">{label}</span>
        <span className="shrink-0 text-xs text-gray-400">×{coefficient}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {binaryOnly && (
          <span className="text-xs text-gray-400 italic mr-1">Oui (5) / Non (0) :</span>
        )}
        {allowedValues.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            title={binaryOnly ? (v === 5 ? 'Oui' : 'Non') : SCORE_LABELS[v]}
            className={`flex h-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${
              binaryOnly ? 'w-14 px-2' : 'w-8'
            } ${
              value === v
                ? 'border border-blue-500 bg-blue-50 text-blue-700'
                : 'border border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {binaryOnly ? (v === 5 ? 'Oui' : 'Non') : v}
          </button>
        ))}
        {binaryOnly
          ? <span className="flex-1" />
          : <span className="ml-2 flex-1 text-xs italic text-gray-400">{SCORE_LABELS[value]}</span>
        }
        <span className="text-xs font-semibold text-gray-500">
          {value * coefficient}/{5 * coefficient} pts
        </span>
      </div>

      {((touched && value === 0) || value === 1 || value === 5) && (
        <div className="mt-2">
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={`Justification obligatoire pour une note de ${value}…`}
            rows={2}
            className={`w-full resize-none rounded-md border px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:ring-1 ${
              !comment.trim()
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-300'
                : 'border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-300'
            }`}
          />
          {!comment.trim() && (
            <p className="mt-0.5 text-xs text-red-500">Ce commentaire est requis</p>
          )}
        </div>
      )}
    </div>
  );
}

function CriterionView({
  num, label, coefficient, score, binaryOnly,
}: { num: number; label: string; coefficient: number; score: number; binaryOnly?: boolean }) {
  const chip =
    score >= 4 ? 'bg-green-100 text-green-700' :
    score >= 3 ? 'bg-blue-100 text-blue-700' :
    score >= 2 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-600';
  const scoreLabel = binaryOnly ? (score === 5 ? 'Oui' : 'Non') : SCORE_LABELS[score];
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-5 py-4">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
        {num}
      </span>
      <span className="flex-1 text-sm leading-snug text-gray-700">{label}</span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${chip}`}>
        {score} — {scoreLabel}
      </span>
      <span className="shrink-0 text-xs text-gray-400">{score * coefficient}/{5 * coefficient} pts</span>
    </div>
  );
}

export default function EvaluationFormPage({ businessPlanId }: { businessPlanId: number }) {
  const router = useRouter();
  const { data: businessPlan, isLoading: loadingBP } = useBusinessPlanById(businessPlanId);
  const { data: gaps = {} } = useEvaluationGaps(businessPlanId);
  const { data: myEvaluations = [], isLoading: loadingMine } = useMyEvaluations();
  const { mutate: submit, isPending } = useSubmitEvaluation(businessPlanId);

  const defaultScores = Object.fromEntries(CRITERIA.map((c) => [c.key, 0])) as Record<string, number>;
  const [scores, setScores] = useState(defaultScores);
  const [criterionComments, setCriterionComments] = useState<Record<string, string>>({});
  const [touchedCriteria, setTouchedCriteria] = useState<Set<string>>(new Set());
  const [globalComment, setGlobalComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const myEval = myEvaluations.find((e) => e.businessPlanId === businessPlanId);
  const alreadyEvaluated = !!myEval;

  const { mutate: update, isPending: isUpdating } = useUpdateEvaluation(myEval?.id ?? 0, businessPlanId);

  const total = CRITERIA.reduce(
    (sum, c) => sum + (scores[c.key as string] ?? 0) * c.coefficient, 0,
  );
  const totalPct = Math.round((total / TOTAL_MAX) * 100);
  const scoreColor =
    totalPct >= 70 ? 'text-green-600' : totalPct >= 40 ? 'text-amber-500' : 'text-red-500';

  const gapCriteria = useMemo(() => {
    if (Object.keys(gaps).length === 0) return new Set<string>();
    const flagged = new Set<string>();
    for (const c of CRITERIA) {
      const avg = gaps[c.key as string];
      if (avg != null && Math.abs((scores[c.key as string] ?? 0) - avg) > 3) {
        flagged.add(c.key as string);
      }
    }
    return flagged;
  }, [scores, gaps]);

  const sections = Array.from(new Set(CRITERIA.map((c) => c.section)));

  const missingComments = CRITERIA.filter(
    (c) => ((touchedCriteria.has(c.key as string) && scores[c.key as string] === 0)
        || scores[c.key as string] === 1
        || scores[c.key as string] === 5)
      && !criterionComments[c.key as string]?.trim(),
  );

  const buildScoresPayload = () =>
    Object.fromEntries(CRITERIA.map((c) => [c.key, scores[c.key as string] ?? 0])) as any;

  const buildCommentsPayload = () => {
    const filtered = Object.fromEntries(Object.entries(criterionComments).filter(([, v]) => v.trim()));
    return Object.keys(filtered).length ? filtered : undefined;
  };

  const handleSubmit = () => {
    if (missingComments.length > 0) return;
    const payload: EvaluationInput = {
      businessPlanId,
      ...buildScoresPayload(),
      conflictOfInterestDeclared: false,
      globalComment: globalComment || undefined,
      criteriaComments: buildCommentsPayload(),
    };
    submit(payload, { onSuccess: () => setSubmitted(true) });
  };

  const handleUpdate = () => {
    if (missingComments.length > 0) return;
    const payload = {
      ...buildScoresPayload(),
      globalComment: globalComment || undefined,
      criteriaComments: buildCommentsPayload(),
    };
    update(payload, { onSuccess: () => setEditMode(false) });
  };

  const initEditMode = () => {
    if (!myEval) return;
    setScores(Object.fromEntries(CRITERIA.map((c) => [c.key, (myEval as any)[c.key as string] ?? 0])));
    setCriterionComments(myEval.criteriaComments ?? {});
    const touched = new Set<string>();
    for (const c of CRITERIA) {
      const score = (myEval as any)[c.key as string] ?? 0;
      const hasComment = !!(myEval.criteriaComments?.[c.key as string]?.trim());
      if (score === 1 || score === 5 || (score === 0 && hasComment)) touched.add(c.key as string);
    }
    setTouchedCriteria(touched);
    setGlobalComment(myEval.globalComment ?? '');
    setEditMode(true);
  };

  if (loadingBP || loadingMine) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader variant="spinner" size="lg" />
      </div>
    );
  }

  if (!businessPlan) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <PiWarning className="mb-3 size-10 text-amber-400" />
        <Text className="text-base font-medium text-gray-700">Plan d'affaires introuvable</Text>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-gray-500">
          Réf. <span className="font-semibold text-gray-700">{businessPlan.referenceNumber}</span>
        </span>
        {businessPlan.status && (
          <Badge variant="flat" color={businessPlan.status.code === 'SUBMITTED' ? 'success' : 'warning'}>
            {STATUS_LABELS[businessPlan.status.code] ?? businessPlan.status.name}
          </Badge>
        )}
      </div>

      {/* ── Chiffres clés ── */}
      <div className="flex flex-wrap gap-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
        {[
          { label: 'Coût total', value: fmtAmount(businessPlan.beneficiary?.totalProjectCost) },
          { label: 'Subvention demandée', value: fmtAmount(businessPlan.beneficiary?.requestedSubsidyAmount) },
          {
            label: 'Apport personnel',
            value: (() => {
              const t = businessPlan.beneficiary?.totalProjectCost;
              const s = businessPlan.beneficiary?.requestedSubsidyAmount;
              return t != null && s != null ? fmtAmount(t - s) : fmtAmount(businessPlan.personalContributionAmount);
            })(),
          },
          ...(businessPlan.copaEdition?.name ? [{ label: 'Édition', value: businessPlan.copaEdition.name }] : []),
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-medium text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Corps ── */}
      {submitted || (alreadyEvaluated && !editMode) ? (
        <div className="space-y-8">
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            submitted ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
          }`}>
            <PiCheckCircle className={`size-5 shrink-0 ${submitted ? 'text-green-500' : 'text-blue-500'}`} />
            <div>
              <p className={`text-sm font-semibold ${submitted ? 'text-green-800' : 'text-blue-800'}`}>
                {submitted ? 'Évaluation soumise avec succès !' : 'Vous avez déjà évalué ce plan'}
              </p>
              <p className="text-xs text-gray-500">Votre évaluation a bien été enregistrée.</p>
            </div>
          </div>

          {myEval && (
            <>
              {sections.map((section) => {
                const criteria = CRITERIA.filter((c) => c.section === section);
                const sectionTotal = criteria.reduce(
                  (s, c) => s + ((myEval as any)[c.key as string] ?? 0) * c.coefficient, 0,
                );
                const sectionMax = criteria.reduce((s, c) => s + 5 * c.coefficient, 0);
                return (
                  <div key={section}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600">{section}</h3>
                      <span className="text-xs text-gray-400">{sectionTotal}/{sectionMax} pts</span>
                    </div>
                    <div className="space-y-3">
                      {criteria.map((c) => (
                        <CriterionView
                          key={c.key as string}
                          num={c.num}
                          label={c.label}
                          coefficient={c.coefficient}
                          binaryOnly={c.binaryOnly}
                          score={(myEval as any)[c.key as string] ?? 0}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <Text className="text-sm font-medium text-gray-600">Score total pondéré</Text>
                <span className={`text-2xl font-bold ${
                  (myEval.totalScore / TOTAL_MAX) * 100 >= 70 ? 'text-green-600' :
                  (myEval.totalScore / TOTAL_MAX) * 100 >= 40 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {myEval.totalScore}/{TOTAL_MAX}
                </span>
              </div>

              {myEval.globalComment && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="mb-1 text-xs font-medium text-gray-500">Commentaire général</p>
                  <p className="text-sm text-gray-700">{myEval.globalComment}</p>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between">
            {!submitted && !myEval?.isFinalEvaluation ? (
              <Button size="sm" onClick={initEditMode}>
                Modifier mon évaluation
              </Button>
            ) : <span />}
            <Button variant="outline" size="sm" onClick={() => router.push(routes.evaluation.search)}>
              Évaluer un autre plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {gapCriteria.size > 0 && (
            <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
              <PiWarning className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Écart significatif détecté</p>
                <p className="mt-0.5 text-sm text-amber-700">
                  Écart de plus de 3 pts avec la moyenne des évaluations existantes sur les critères{' '}
                  <span className="font-semibold">
                    {CRITERIA.filter((c) => gapCriteria.has(c.key as string)).map((c) => `n°${c.num}`).join(', ')}
                  </span>.
                </p>
              </div>
            </div>
          )}

          {sections.map((section) => {
            const criteria = CRITERIA.filter((c) => c.section === section);
            const sectionTotal = criteria.reduce(
              (s, c) => s + (scores[c.key as string] ?? 0) * c.coefficient, 0,
            );
            const sectionMax = criteria.reduce((s, c) => s + 5 * c.coefficient, 0);
            return (
              <div key={section}>
                <div className="mb-1.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600">{section}</h3>
                  <span className="text-xs text-gray-400">{sectionTotal}/{sectionMax} pts</span>
                </div>
                <div className="space-y-3">
                  {criteria.map((c) => (
                    <CriterionInput
                      key={c.key as string}
                      num={c.num}
                      label={c.label}
                      coefficient={c.coefficient}
                      binaryOnly={c.binaryOnly}
                      value={scores[c.key as string] ?? 0}
                      hasGap={gapCriteria.has(c.key as string)}
                      comment={criterionComments[c.key as string] ?? ''}
                      touched={touchedCriteria.has(c.key as string)}
                      onChange={(v) => {
                        setTouchedCriteria((prev) => new Set([...prev, c.key as string]));
                        setScores((prev) => ({ ...prev, [c.key as string]: v }));
                        if (v !== 0 && v !== 1 && v !== 5) {
                          setCriterionComments((prev) => {
                            const next = { ...prev };
                            delete next[c.key as string];
                            return next;
                          });
                        }
                      }}
                      onCommentChange={(c2) =>
                        setCriterionComments((prev) => ({ ...prev, [c.key as string]: c2 }))
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <Text className="text-sm font-medium text-gray-600">Score total pondéré</Text>
              <Text className="text-xs text-gray-400">0=Nul · 1=Très faible · 2=Faible · 3=Assez bien · 4=Bien · 5=Excellent</Text>
            </div>
            <span className={`text-2xl font-bold ${scoreColor}`}>{total}/{TOTAL_MAX}</span>
          </div>

          <Textarea
            label="Commentaire général (optionnel)"
            placeholder="Observations complémentaires sur ce plan d'affaires…"
            value={globalComment}
            onChange={(e) => setGlobalComment(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3">
            {editMode && (
              <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                Annuler
              </Button>
            )}
            <Button
              onClick={editMode ? handleUpdate : handleSubmit}
              isLoading={editMode ? isUpdating : isPending}
              disabled={(editMode ? isUpdating : isPending) || missingComments.length > 0}
            >
              {editMode ? 'Enregistrer les modifications' : "Soumettre l'évaluation"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
