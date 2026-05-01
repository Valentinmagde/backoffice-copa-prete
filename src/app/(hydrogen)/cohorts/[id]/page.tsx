'use client';

import { use, useState } from 'react';
import { Loader, Text, Badge, Button } from 'rizzui';
import { Input } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import {
    useCohort,
    useCohortePhases,
    useTogglePhase,
    useUpdatePhaseDates,
} from '@/lib/api/hooks/use-cohorts';
import {
    PiCalendar,
    PiToggleLeft,
    PiToggleRight,
    PiPencilSimple,
    PiCheckCircle,
    PiXCircle,
    PiUsers,
    PiHash,
} from 'react-icons/pi';
import { formatDate } from '@core/utils/format-date';

// ─── Composants utilitaires ───────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon }: {
    label: string;
    value?: string | null;
    icon?: React.ElementType;
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-dashed border-gray-200 last:border-0">
            {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-gray-400" />}
            <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                <Text className="text-sm font-medium text-gray-500">{label}</Text>
                <Text className="text-sm text-gray-800">{value || '—'}</Text>
            </div>
        </div>
    );
}

const PHASE_BADGE: Record<string, any> = {
    REGISTRATION:             'info',
    CANDIDATURE_SUBMISSION:   'primary',
    BUSINESS_PLAN_SUBMISSION: 'secondary',
    EVALUATION:               'warning',
    SELECTION:                'success',
    AWARDING:                 'success',
    MENTORING:                'info',
    MONITORING:               'info',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const editionId = Number(id);

    const { data: cohort, isLoading: cohortLoading } = useCohort(editionId);
    const { data: phases, isLoading: phasesLoading } = useCohortePhases(editionId);
    const { mutate: togglePhase, isPending: isToggling } = useTogglePhase(editionId);
    const { mutate: updateDates, isPending: isUpdatingDates } = useUpdatePhaseDates(editionId);

    const [editingPhase, setEditingPhase] = useState<number | null>(null);
    const [draftDates, setDraftDates] = useState({ startDate: '', endDate: '' });

    const startEdit = (phase: any) => {
        setEditingPhase(phase.id);
        setDraftDates({
            startDate: phase.startDate?.slice(0, 10) ?? '',
            endDate:   phase.endDate?.slice(0, 10)   ?? '',
        });
    };

    const confirmEdit = (phaseId: number) => {
        updateDates(
            { phaseId, startDate: draftDates.startDate, endDate: draftDates.endDate },
            { onSuccess: () => setEditingPhase(null) }
        );
    };

    if (cohortLoading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader variant="spinner" size="lg" />
        </div>
    );

    if (!cohort) return (
        <div className="flex h-64 items-center justify-center">
            <Text className="text-gray-500">Édition introuvable</Text>
        </div>
    );

    const sortedPhases = [...(phases ?? [])].sort(
        (a: any, b: any) => a.displayOrder - b.displayOrder
    );

    return (
        <div className="@container space-y-8">
            <PageHeader
                title={cohort.nameFr ?? cohort.name}
                breadcrumb={[
                    { name: 'Cohortes', href: routes.cohorts.list },
                    { name: cohort.nameFr ?? cohort.name },
                ]}
            >
                <Badge
                    color={cohort.isActive ? 'success' : 'danger'}
                    variant="flat"
                    className="text-sm"
                >
                    {cohort.isActive ? 'Active' : 'Inactive'}
                </Badge>
            </PageHeader>

            {/* Informations générales */}
            <FormGroup
                title="Informations générales"
                description="Détails de cette édition COPA."
            >
                <div className="col-span-full @4xl:col-span-8 rounded-lg border border-muted bg-white p-6">
                    <InfoRow icon={PiHash}     label="Code"        value={cohort.code} />
                    <InfoRow icon={PiCalendar} label="Année"       value={String(cohort.year)} />
                    <InfoRow icon={PiUsers}    label="Participants" value={String(cohort.participantCount ?? 0)} />
                    <InfoRow
                        icon={PiCalendar}
                        label="Période d'inscription"
                        value={
                            cohort.registrationStartDate && cohort.registrationEndDate
                                ? `${formatDate(new Date(cohort.registrationStartDate), 'D MMM YYYY')} → ${formatDate(new Date(cohort.registrationEndDate), 'D MMM YYYY')}`
                                : '—'
                        }
                    />
                    <InfoRow
                        icon={PiCalendar}
                        label="Période de soumission"
                        value={
                            cohort.submissionStartDate && cohort.submissionEndDate
                                ? `${formatDate(new Date(cohort.submissionStartDate), 'D MMM YYYY')} → ${formatDate(new Date(cohort.submissionEndDate), 'D MMM YYYY')}`
                                : '—'
                        }
                    />
                </div>
            </FormGroup>

            {/* Gestion des phases */}
            <FormGroup
                title="Phases"
                description="Activez ou désactivez chaque phase pour contrôler l'accès des candidats."
            >
                <div className="col-span-full @4xl:col-span-8 rounded-lg border border-muted bg-white overflow-hidden">
                    {phasesLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader variant="spinner" size="md" />
                        </div>
                    ) : sortedPhases.length === 0 ? (
                        <div className="flex h-40 items-center justify-center">
                            <Text className="text-gray-400">Aucune phase trouvée</Text>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {sortedPhases.map((phase: any) => {
                                const isEditing = editingPhase === phase.id;

                                return (
                                    <div key={phase.id} className="flex items-start gap-4 px-6 py-4">
                                        {/* Numéro */}
                                        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                                            {phase.displayOrder}
                                        </div>

                                        {/* Contenu */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <Text className="text-sm font-semibold text-gray-800">
                                                    {phase.phaseNameFr ?? phase.phaseName}
                                                </Text>
                                                <Badge
                                                    color={PHASE_BADGE[phase.phaseCode] ?? 'default'}
                                                    variant="flat"
                                                    className="text-xs"
                                                >
                                                    {phase.phaseCode}
                                                </Badge>
                                            </div>

                                            {isEditing ? (
                                                <div className="mt-3 flex flex-wrap items-end gap-3">
                                                    <Input
                                                        type="date"
                                                        label="Date de début"
                                                        value={draftDates.startDate}
                                                        onChange={e => setDraftDates(d => ({ ...d, startDate: e.target.value }))}
                                                        className="w-40"
                                                    />
                                                    <Input
                                                        type="date"
                                                        label="Date de fin"
                                                        value={draftDates.endDate}
                                                        onChange={e => setDraftDates(d => ({ ...d, endDate: e.target.value }))}
                                                        className="w-40"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        color="success"
                                                        className="gap-1.5"
                                                        isLoading={isUpdatingDates}
                                                        onClick={() => confirmEdit(phase.id)}
                                                    >
                                                        <PiCheckCircle className="size-4" />
                                                        Confirmer
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5"
                                                        onClick={() => setEditingPhase(null)}
                                                    >
                                                        <PiXCircle className="size-4" />
                                                        Annuler
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="mt-1 flex flex-wrap items-center gap-3">
                                                    <Text className="flex items-center gap-1 text-xs text-gray-500">
                                                        <PiCalendar className="size-3.5" />
                                                        {formatDate(new Date(phase.startDate), 'D MMM YYYY')}
                                                        {' → '}
                                                        {formatDate(new Date(phase.endDate), 'D MMM YYYY')}
                                                    </Text>
                                                    <button
                                                        onClick={() => startEdit(phase)}
                                                        className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                                                    >
                                                        <PiPencilSimple className="size-3.5" />
                                                        Modifier les dates
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Toggle */}
                                        <button
                                            onClick={() => togglePhase(phase.id)}
                                            disabled={isToggling}
                                            title={phase.isActive ? 'Désactiver' : 'Activer'}
                                            className="mt-0.5 shrink-0 disabled:opacity-50"
                                        >
                                            {phase.isActive ? (
                                                <PiToggleRight className="size-9 text-green-500" />
                                            ) : (
                                                <PiToggleLeft className="size-9 text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </FormGroup>
        </div>
    );
}
