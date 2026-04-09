'use client';

import { use } from 'react';
import { Loader, Text, Badge, Button } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import { useMPMECandidature } from '@/lib/api/hooks/use-mpme';
import {
    PiCheckCircle, PiXCircle, PiClockCountdown,
    PiWarning, PiStar,
} from 'react-icons/pi';
import SelectionActions from '@/app/shared/mpme/candidatures/selection-actions';

const STEPS = [
    { key: 'REGISTERED', label: 'Inscrit', icon: PiClockCountdown, color: 'text-orange-500' },
    { key: 'PRE_SELECTED', label: 'Présélectionné', icon: PiStar, color: 'text-blue-500' },
    { key: 'VALIDATED', label: 'Validé', icon: PiCheckCircle, color: 'text-green-500' },
    { key: 'REJECTED', label: 'Rejeté', icon: PiXCircle, color: 'text-red-500' },
];

function InfoRow({ label, value }: { label: string; value?: any }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200 last:border-0">
            <Text className="text-sm text-gray-500">{label}</Text>
            <Text className="text-sm font-medium text-gray-800">{value ?? '—'}</Text>
        </div>
    );
}

export default function StatutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: b, isLoading } = useMPMECandidature(Number(id));

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>;

    const currentStatus = b?.status?.code;

    
    const mapStatus = (status: string) => {
        switch (status) {
            case 'REGISTERED':
                return 'Inscrit';
            case 'PRE_SELECTED':
                return 'Présélectionné';
            case 'SELECTED':
                return 'Sélectionné';
            case 'REJECTED':
                return 'Rejeté';
            default:
                return 'Non soumis';
        };
    };

    return (
        <div className="@container space-y-8">
            {/* Timeline statut */}
            <FormGroup title="Progression du dossier" className="@3xl:grid-cols-12">
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <div className="relative flex flex-col gap-0">
                        {STEPS.filter(s => s.key !== 'REJECTED').map((step, i) => {
                            const isActive = currentStatus === step.key;
                            const isPassed = STEPS.findIndex(s => s.key === currentStatus) > i;
                            const isRejected = currentStatus === 'REJECTED';
                            const Icon = step.icon;

                            return (
                                <div key={step.key} className="flex items-start gap-4">
                                    {/* Ligne verticale */}
                                    <div className="flex flex-col items-center">
                                        <div className={`flex size-9 items-center justify-center rounded-full border-2 ${isActive ? 'border-primary-500 bg-primary-50' :
                                            isPassed ? 'border-green-500 bg-green-50' :
                                                isRejected ? 'border-red-200 bg-red-50' :
                                                    'border-gray-200 bg-gray-50'
                                            }`}>
                                            <Icon className={`size-4 ${isActive ? 'text-primary-500' :
                                                isPassed ? 'text-green-500' :
                                                    'text-gray-400'
                                                }`} />
                                        </div>
                                        {i < 2 && (
                                            <div className={`w-0.5 h-8 ${isPassed ? 'bg-green-300' : 'bg-gray-200'}`} />
                                        )}
                                    </div>

                                    <div className="pb-8">
                                        <Text className={`text-sm font-semibold ${isActive ? 'text-primary-600' :
                                            isPassed ? 'text-green-600' :
                                                'text-gray-400'
                                            }`}>
                                            {step.label}
                                        </Text>
                                        {isActive && (
                                            <Badge color="primary" variant="flat" className="mt-1 text-xs">
                                                Statut actuel
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Rejet affiché séparément */}
                        {currentStatus === 'REJECTED' && (
                            <div className="mt-2 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                                <PiXCircle className="size-5 text-red-500 shrink-0" />
                                <div>
                                    <Text className="text-sm font-semibold text-red-700">Dossier rejeté</Text>
                                    {b?.rejectionReason && (
                                        <Text className="text-xs text-red-500 mt-1">{b.rejectionReason}</Text>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </FormGroup>

            {/* Détails statut */}
            <FormGroup title="Détails de traitement" className="@3xl:grid-cols-12">
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <InfoRow label="Code candidature" value={b?.applicationCode} />
                    <InfoRow label="Date d'inscription"
                        value={b?.createdAt ? new Date(b.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : null}
                    />
                    <InfoRow label="Profil complété le"
                        value={b?.profileCompletedAt ? new Date(b.profileCompletedAt).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : null}
                    />
                    <InfoRow label="Validé le"
                        value={b?.validatedAt ? new Date(b.validatedAt).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : null}
                    />
                    <InfoRow label="Édition COPA" value={b?.copaEdition?.name} />

                    {/* Complétion */}
                    <div className="pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <Text className="text-sm text-gray-500">Complétion du profil</Text>
                            <Text className="text-sm font-bold text-gray-800">{b?.profileCompletionPercentage}%</Text>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-primary-500 transition-all"
                                style={{ width: `${b?.profileCompletionPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </FormGroup>

            {b?.status?.code && !['VALIDATED'].includes(b.status.code) && (
                <FormGroup title="Actions" description="Gérer le statut de ce dossier" className="@3xl:grid-cols-12">
                    <div className="@3xl:col-span-8">
                        <div className="rounded-lg border border-muted bg-white p-6">
                            <Text className="mb-4 text-sm text-gray-500">
                                Statut actuel :{' '}
                                <Badge color={b?.status?.code === 'REJECTED' ? "danger" : b?.status?.code === 'SELECTED' ? "success" : b?.status?.code === 'PRE_SELECTED' ? "primary" : "warning"} variant="flat">{mapStatus(b.status.code)}</Badge>
                            </Text>
                            <SelectionActions
                                beneficiaryId={b.id}
                                currentStatus={b.status.code}
                                beneficiaryName={`${b.user?.firstName} ${b.user?.lastName}`}
                            />
                        </div>
                    </div>
                </FormGroup>
            )}
        </div>
    );
}