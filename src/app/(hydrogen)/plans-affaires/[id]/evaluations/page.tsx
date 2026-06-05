'use client';

import React, { use, Suspense, Fragment } from 'react';
import { Loader, Badge, Text, Tooltip, ActionIcon } from 'rizzui';
import { PiStar, PiPrinter, PiDownloadSimple } from 'react-icons/pi';
import { useEvaluationsByBusinessPlan } from '@/lib/api/hooks/use-evaluateurs';
import type { Evaluation } from '@/lib/api/types/evaluateur.types';
import { SCORE_CRITERIA as CRITERIA, TOTAL_MAX } from '@/lib/api/types/evaluateur.types';

const RECOMMENDATION_LABELS: Record<string, string> = {
  STRONGLY_RECOMMENDED:      'Fortement recommandé',
  RECOMMENDED:               'Recommandé',
  RECOMMENDED_WITH_RESERVES: 'Recommandé avec réserves',
  NOT_RECOMMENDED:           'Non recommandé',
};

const fmtDate = (d?: string | Date | null) =>
  d ? new Date(d as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const SUM_COEFFS = CRITERIA.reduce((s, c) => s + c.coefficient, 0);

function scoreClass(s: number): string {
  if (s >= 4) return 'bg-green-100 text-green-700';
  if (s >= 3) return 'bg-blue-100 text-blue-700';
  if (s >= 2) return 'bg-amber-100 text-amber-700';
  if (s >= 1) return 'bg-red-100 text-red-600';
  return 'bg-gray-100 text-gray-400';
}

function totalClass(pct: number): string {
  if (pct >= 70) return 'text-green-600';
  if (pct >= 40) return 'text-amber-600';
  return 'text-red-600';
}

const COLS = 8; // label + 3 évaluateurs + moyenne + coeff + pondérée + commentaire

const TH = 'bg-gray-100 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500';
const TH_L = `${TH} text-left`;
const TH_C = `${TH} text-center`;

function EvaluationsGrid({ evaluations }: { evaluations: Evaluation[] }) {
  const MAX = 3;
  const slots: (Evaluation | null)[] = [
    ...evaluations.slice(0, MAX),
    ...Array(MAX - Math.min(evaluations.length, MAX)).fill(null),
  ];

  const sections = Array.from(new Set(CRITERIA.map((c) => c.section)));

  const slotTotals = slots
    .filter((ev): ev is Evaluation => ev !== null)
    .map((e) => CRITERIA.reduce((sum, c) => sum + ((e as any)[c.key as string] ?? 0) * c.coefficient, 0));
  const avgTotal = slotTotals.length > 0
    ? slotTotals.reduce((s, t) => s + t, 0) / slotTotals.length
    : null;

  return (
    <div className="custom-scrollbar overflow-x-auto rounded-md border border-muted">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th rowSpan={2} className={`${TH_L} min-w-[260px]`}>
              Critère
            </th>
            <th colSpan={MAX + 1} className={TH_C}>
              Notation
            </th>
            <th rowSpan={2} className={`${TH_C} whitespace-nowrap`}>
              Coefficient
            </th>
            <th rowSpan={2} className={`${TH_C} whitespace-nowrap`}>
              Note pondérée
            </th>
            <th rowSpan={2} className={`${TH_C} border-r-0`}>
              Commentaire
            </th>
          </tr>
          <tr>
            {slots.map((ev, i) => (
              <th key={i} className={`${TH_C} whitespace-nowrap`}>
                {ev?.evaluator?.user
                  ? `${ev.evaluator.user.firstName} ${ev.evaluator.user.lastName}`
                  : `Évaluateur ${i + 1}`}
              </th>
            ))}
            <th className={TH_C}>
              Moyenne
            </th>
          </tr>
        </thead>

        <tbody>
          {sections.map((section) => {
            const criteria = CRITERIA.filter((c) => c.section === section);
            return (
              <Fragment key={section}>
                <tr className="border-b border-muted bg-gray-50">
                  <td colSpan={COLS} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-600">
                    {section}
                  </td>
                </tr>

                {criteria.map((c) => {
                  const scores = slots.map((ev) =>
                    ev !== null ? ((ev as any)[c.key as string] ?? null) as number | null : null,
                  );
                  const valid = scores.filter((s): s is number => s !== null);
                  const avg = valid.length > 0
                    ? valid.reduce((a, b) => a + b, 0) / valid.length
                    : null;
                  const weighted = avg !== null ? avg * c.coefficient : null;
                  const maxW     = 5 * c.coefficient;
                  const slotComments = slots.map((ev) =>
                    ev?.criteriaComments?.[c.key as string] ?? null,
                  );

                  return (
                    <tr key={c.key as string} className="border-b border-muted hover:bg-gray-50">
                      <td className="px-3 py-4 text-xs text-gray-700">
                        <span className="mr-1.5 font-bold text-gray-400">{c.num}.</span>
                        {c.label}
                      </td>

                      {scores.map((score, i) => {
                        const comment = slotComments[i];
                        const badge = score !== null ? (
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${scoreClass(score)}`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        );
                        return (
                          <td key={i} className="px-3 py-4 text-center">
                            {comment ? (
                              <Tooltip content={comment} placement="top">
                                <span className="relative inline-block cursor-help">
                                  {badge}
                                  <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-blue-400" />
                                </span>
                              </Tooltip>
                            ) : badge}
                          </td>
                        );
                      })}

                      <td className="px-3 py-4 text-center">
                        {avg !== null ? (
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${scoreClass(Math.round(avg))}`}>
                            {avg.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-3 py-4 text-center text-xs font-bold text-gray-500">
                        ×{c.coefficient}
                      </td>

                      <td className="px-3 py-4 text-center text-xs text-gray-600">
                        {weighted !== null ? (
                          <>{weighted.toFixed(2)}<span className="text-gray-400">/{maxW}</span></>
                        ) : '—'}
                      </td>

                      <td className="px-3 py-4 text-xs text-gray-500">
                        {slots
                          .map((ev, i) => {
                            const text = ev?.criteriaComments?.[c.key as string];
                            if (!text) return null;
                            const name = ev?.evaluator?.user
                              ? `${ev.evaluator.user.firstName} ${ev.evaluator.user.lastName}`
                              : `Évaluateur ${i + 1}`;
                            return (
                              <span key={i}>
                                {text}{' '}
                                <span className="font-semibold text-primary-600">({name})</span>
                              </span>
                            );
                          })
                          .filter(Boolean)
                          .reduce<React.ReactNode[]>((acc, node, i) => (
                            i === 0 ? [node] : [...acc, <span key={`sep-${i}`} className="mx-1 text-gray-300">·</span>, node]
                          ), [])}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            );
          })}

          {/* Ligne total */}
          <tr className="border-t-2 border-muted bg-gray-100">
            <td className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">
              Total de l'évaluation sur {TOTAL_MAX}
            </td>
            {slots.map((ev, i) => {
              const t = ev
                ? CRITERIA.reduce((sum, c) => sum + ((ev as any)[c.key as string] ?? 0) * c.coefficient, 0)
                : null;
              return (
                <td key={i} className="px-3 py-4 text-center">
                  {t !== null ? (
                    <span className={`text-sm font-bold ${totalClass((t / TOTAL_MAX) * 100)}`}>
                      {t}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              );
            })}
            <td className="px-3 py-4 text-center">
              {avgTotal !== null ? (
                <span className={`text-sm font-bold ${totalClass((avgTotal / TOTAL_MAX) * 100)}`}>
                  {avgTotal.toFixed(2)}
                </span>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              )}
            </td>
            <td className="px-3 py-4 text-center text-xs font-bold text-gray-500">
              {SUM_COEFFS}
            </td>
            <td className="px-3 py-4 text-center">
              {avgTotal !== null ? (
                <span className={`text-sm font-bold ${totalClass((avgTotal / TOTAL_MAX) * 100)}`}>
                  {avgTotal.toFixed(2)}<span className="text-xs font-normal text-gray-400">/{TOTAL_MAX}</span>
                </span>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              )}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function EvaluationsContent({ businessPlanId }: { businessPlanId: number }) {
  const { data: evaluations = [], isLoading } = useEvaluationsByBusinessPlan(businessPlanId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader variant="spinner" size="lg" />
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <Text className="text-sm text-gray-400">Aucune évaluation soumise pour le moment</Text>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleExportCsv = () => {
    const MAX = 3;
    const slots: (Evaluation | null)[] = [
      ...evaluations.slice(0, MAX),
      ...Array(MAX - Math.min(evaluations.length, MAX)).fill(null),
    ];
    const evalNames = slots.map((ev, i) =>
      ev?.evaluator?.user
        ? `${ev.evaluator.user.firstName} ${ev.evaluator.user.lastName}`
        : ev ? `Évaluateur ${i + 1}` : '',
    );

    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

    const headers = [
      'N°', 'Critère', 'Section', 'Coefficient',
      ...slots.map((_, i) => `Score ${evalNames[i] || `Évaluateur ${i + 1}`}`),
      'Moyenne', 'Note pondérée', 'Note max', 'Commentaires',
    ].map(esc).join(',');

    const dataRows = CRITERIA.map((c) => {
      const scores = slots.map((ev) =>
        ev !== null ? String((ev as any)[c.key as string] ?? '') : '',
      );
      const valid = scores
        .map((s, i) => (slots[i] !== null && s !== '' ? Number(s) : null))
        .filter((s): s is number => s !== null);
      const avg = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
      const weighted = avg !== null ? (avg * c.coefficient).toFixed(2) : '';
      const comments = slots
        .map((ev, i) => {
          const text = ev?.criteriaComments?.[c.key as string];
          return text ? `${text} (${evalNames[i]})` : null;
        })
        .filter(Boolean)
        .join(' | ');
      return [
        String(c.num), c.label, c.section, String(c.coefficient),
        ...scores,
        avg !== null ? avg.toFixed(2) : '', weighted, String(5 * c.coefficient), comments,
      ].map(esc).join(',');
    });

    const slotTotals = slots
      .filter((ev): ev is Evaluation => ev !== null)
      .map((e) => CRITERIA.reduce((sum, c) => sum + ((e as any)[c.key as string] ?? 0) * c.coefficient, 0));
    const avgTotal = slotTotals.length > 0
      ? slotTotals.reduce((s, t) => s + t, 0) / slotTotals.length : null;
    const totalRow = [
      '', `Total /${TOTAL_MAX}`, '', '',
      ...slots.map((ev) =>
        ev ? String(CRITERIA.reduce((sum, c) => sum + ((ev as any)[c.key as string] ?? 0) * c.coefficient, 0)) : '',
      ),
      avgTotal !== null ? avgTotal.toFixed(2) : '', '', String(TOTAL_MAX), '',
    ].map(esc).join(',');

    const csv = [headers, ...dataRows, totalRow].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations-plan-${businessPlanId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFooter = evaluations.some((ev) => ev.recommendation || ev.globalComment);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .eval-print-zone, .eval-print-zone * { visibility: visible; }
          .eval-print-zone { position: absolute; top: 0; left: 0; width: 100%; padding: 1rem; }
          .eval-no-print { display: none !important; }
        }
      `}</style>

      <div className="eval-print-zone space-y-6">
        {/* Pastilles évaluateurs + Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            Évaluations ({evaluations.length}/3)
          </span>
          {evaluations.map((ev, i) => (
            <div key={ev.id}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600"
            >
              <span className="font-medium">
                {ev.evaluator?.user
                  ? `${ev.evaluator.user.firstName} ${ev.evaluator.user.lastName}`
                  : `Évaluateur ${i + 1}`}
              </span>
              <span className="text-gray-300">·</span>
              <span>{fmtDate(ev.evaluationDate)}</span>
              {ev.isFinalEvaluation && (
                <Badge color="success" variant="flat" className="gap-1 text-xs">
                  <PiStar className="size-3" /> Finale
                </Badge>
              )}
            </div>
          ))}
          <div className="eval-no-print ml-auto flex gap-2">
            <Tooltip content="Exporter en CSV" placement="top">
              <ActionIcon variant="outline" size="sm" onClick={handleExportCsv}>
                <PiDownloadSimple className="size-4" />
              </ActionIcon>
            </Tooltip>
            <Tooltip content="Imprimer / Exporter PDF" placement="top">
              <ActionIcon variant="outline" size="sm" onClick={handlePrint}>
                <PiPrinter className="size-4" />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>

        {/* Tableau de synthèse */}
        <EvaluationsGrid evaluations={evaluations} />

        {/* Recommandations & commentaires globaux */}
        {hasFooter && (
          <div className="grid gap-4 sm:grid-cols-3">
            {evaluations.map((ev, i) =>
              ev.recommendation || ev.globalComment ? (
                <div key={ev.id} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-500">
                    {ev.evaluator?.user
                      ? `${ev.evaluator.user.firstName} ${ev.evaluator.user.lastName}`
                      : `Évaluateur ${i + 1}`}
                  </p>
                  {ev.recommendation && (
                    <div className="rounded-lg bg-blue-50 px-3 py-2">
                      <p className="mb-0.5 text-xs text-gray-400">Recommandation</p>
                      <p className="text-sm font-medium text-blue-700">
                        {RECOMMENDATION_LABELS[ev.recommendation] ?? ev.recommendation}
                      </p>
                    </div>
                  )}
                  {ev.globalComment && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="mb-0.5 text-xs text-gray-400">Commentaire général</p>
                      <p className="text-sm text-gray-700">{ev.globalComment}</p>
                    </div>
                  )}
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function BusinessPlanEvaluationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="@container space-y-8">
      <Suspense fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader variant="spinner" size="lg" />
        </div>
      }>
        <EvaluationsContent businessPlanId={Number(id)} />
      </Suspense>
    </div>
  );
}
