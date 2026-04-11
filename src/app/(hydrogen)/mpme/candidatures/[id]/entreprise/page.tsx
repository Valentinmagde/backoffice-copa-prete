'use client';

import { use } from 'react';
import { Loader, Text, Badge } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import { useMPMECandidature } from '@/lib/api/hooks/use-mpme';
import { PiBuildings, PiUsers, PiCurrencyDollar, PiMapPin } from 'react-icons/pi';

// function InfoRow({ label, value}: { label: string; value?: any }) {
//     return (
//         <div className="flex flex-col gap-0.5 py-3 border-b border-dashed border-gray-200 last:border-0 sm:flex-row sm:items-center sm:justify-between gap-10">
//             <Text className="text-sm text-gray-500">{label}</Text>
//             <Text className="text-sm font-medium text-gray-800">{value ?? '—'}</Text>
//         </div>
//     );
// }

function InfoRow({ label, value }: { label: string; value?: any }) {
    return (
        <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
            <Text className="text-sm font-medium tracking-wider text-gray-400">{label}</Text>
            <Text className="text-sm text-gray-800 text-justify">{value ?? '—'}</Text>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color = 'text-primary-500' }: any) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-muted bg-white p-4">
            <div className={`rounded-lg bg-gray-100 p-2 ${color}`}>
                <Icon className="size-5" />
            </div>
            <div>
                <Text className="text-xl font-bold text-gray-800">{value ?? 0}</Text>
                <Text className="text-xs text-gray-500">{label}</Text>
            </div>
        </div>
    );
}

export default function EntreprisePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: b, isLoading } = useMPMECandidature(Number(id));

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>;

    const co = b?.company;
    if (!co) return (
        <div className="flex h-64 items-center justify-center flex-col gap-2">
            <PiBuildings className="size-12 text-gray-300" />
            <Text className="text-gray-500">Aucune entreprise enregistrée</Text>
        </div>
    );

    const mapLegalStatus = (legalStatus?: string | null): string => {
        switch (legalStatus) {
            case 'php': return 'Personne physique';
            case 'snc': return 'Société en Nom Collectif (SNC)';
            case 'sprl': return 'Société de Personnes à Responsabilité Limitée (SPRL)';
            case 'scs': return 'Société en Commandite Simple (SCS)';
            case 'su': return 'Société Unipersonnelle (SU)';
            case 'sa': return 'Société Anonyme (SA)';
            case 'coop': return 'Société Coopérative';
            default: return legalStatus || '--';
        }
    }

    return (
        <div className="@container space-y-8">
            {/* Informations générales */}
            <FormGroup title="Informations générales" description="Données de l'entreprise (MPME) ou de la Coopérative" className="@3xl:grid-cols-12">
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <InfoRow label="Nom de l'entreprise" value={co.companyName} />
                    <InfoRow label="Statut de l'entreprise (MPME) ou de la Coopérative"
                        value={
                            <Badge color={co.companyType === 'formal' ? 'success' : 'warning'} variant="flat" className="capitalize">
                                {co.companyType === 'formal' ? 'Formel' : 'Informel'}
                            </Badge>
                        }
                    />
                    {co.companyType === 'formal' && (
                        <>
                            <InfoRow label="Statut légal de l'entreprise (MPME) ou de la Coopérative" value={mapLegalStatus(co.legalStatus)} />
                            <InfoRow label="NIF ou numéro d'enregistrement" value={co.taxIdNumber} />
                        </>
                    )}
                    <InfoRow label="Date de création"
                        value={co.creationDate ? new Date(co.creationDate).toLocaleDateString('fr-FR') : null}
                    />
                    <InfoRow label="Secteur d'activité" value={co.primarySector?.name || co.otherCompanySector} />
                    <InfoRow label="Description de l'activité principale" value={co.activityDescription} />
                    {co.companyAddressIsDifferent && (
                        <>
                            <InfoRow label="Numéro de téléphone" value={co.companyPhone} />
                            <InfoRow label="Adresse e-mail" value={co.companyEmail} />
                        </>
                    )}
                    <InfoRow label="Votre entreprise ou Coopérative a-t-elle déjà eu recours à un service d’appui aux entreprises ?"
                        value={<Badge color={co.supportService ? 'success' : 'default'} variant="flat">{co.supportService ? 'Oui' : 'Non'}</Badge>}
                    />
                </div>
            </FormGroup>

            {/* Informations générales */}
            {co.companyAddressIsDifferent && (
                <FormGroup title="Adresse" description="Localisation du représentant" className="@3xl:grid-cols-12">
                    <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                        <InfoRow label="Province" value={b.user?.primaryAddress?.province} />
                        <InfoRow label="Commune" value={b.user?.primaryAddress?.commune} />
                        <InfoRow label="Colline / Quartier" value={b.user?.primaryAddress?.neighborhood} />
                        <InfoRow label="Zone" value={b.user?.primaryAddress?.street} />
                    </div>
                </FormGroup>
            )}

            {/* Employés — stats */}
            <FormGroup title="Le personnel" description="Répartition des employés" className="@3xl:grid-cols-12">
                <div className="grid grid-cols-2 gap-4 @3xl:col-span-8 sm:grid-cols-3">
                    <StatCard label="Total employés" value={co.employees?.female + co.employees?.male} icon={PiUsers} />
                    <StatCard label="Nombre de femmes" value={co.employees?.female} icon={PiUsers} color="text-pink-500" />
                    <StatCard label="Nombre d'hommes" value={co.employees?.male} icon={PiUsers} color="text-blue-500" />
                    <StatCard label="Nombre de réfugiés" value={co.employees?.refugee} icon={PiUsers} color="text-orange-500" />
                    <StatCard label="Nombre de Batwa" value={co.employees?.batwa} icon={PiUsers} color="text-purple-500" />
                    <StatCard label="Nombre de personnes vivant avec un handicap" value={co.employees?.disabled} icon={PiUsers} color="text-red-500" />
                    <StatCard label="Nombre d’albinos" value={co.employees?.albinos} icon={PiUsers} color="text-yellow-500" />
                    <StatCard label="Nombre de rapatriés" value={co.employees?.repatriates} icon={PiUsers} color="text-teal-500" />
                    <StatCard label="Nombre d’employé(e)s à temps partiel" value={co.employees?.partTime} icon={PiUsers} color="text-gray-500" />
                    <StatCard label="Nombre d'employés permanents" value={co.employees?.permanent} icon={PiUsers} color="text-gray-500" />
                </div>
            </FormGroup>

            {/* Associés */}
            {co.associates?.count && co.associates?.count !== 'solo' && (
                <FormGroup title="Associés" description="Répartition des associé(e)s" className="@3xl:grid-cols-12">
                    <div className="grid grid-cols-2 gap-4 @3xl:col-span-8 sm:grid-cols-3">
                        <StatCard label="Nombre d'associés" value={co.associates?.count === 'other' ? co.associates?.countOther : co.associates?.count} icon={PiUsers} />
                        <StatCard label="Nombre de femmes associées" value={co.associates?.partners?.female} icon={PiUsers} color="text-pink-500" />
                        <StatCard label="Nombre d'hommes associés" value={co.associates?.partners?.male} icon={PiUsers} color="text-blue-500" />
                        <StatCard label="Nombre de réfugiés associés" value={co.associates?.partners?.refugee} icon={PiUsers} color="text-orange-500" />
                        <StatCard label="Nombre de Batwa associés" value={co.associates?.partners?.batwa} icon={PiUsers} color="text-purple-500" />
                        <StatCard label="Nombre de personnes vivant avec un handicap associés" value={co.associates?.partners?.disabled} icon={PiUsers} color="text-red-500" />
                        <StatCard label="Nombre d’albinos associés" value={co.associates?.partners?.albinos} icon={PiUsers} color="text-yellow-500" />
                        <StatCard label="Nombre de rapatriés associés" value={co.associates?.partners?.repatriates} icon={PiUsers} color="text-teal-500" />

                    </div>
                </FormGroup>
            )}

            {/* Finances */}
            <FormGroup title="Finances" description="Situation financière" className="@3xl:grid-cols-12">
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <InfoRow label="Chiffre d'affaires de l'année précédente (BIF)"
                        value={co.finances?.annualRevenue ? `${Number(co.finances.annualRevenue).toLocaleString('fr-FR')} BIF` : null}
                    />
                    <InfoRow label="L'entreprise dispose-t-elle d'un compte bancaire ?"
                        value={<Badge color={co.finances?.hasBankAccount ? 'success' : 'default'} variant="flat">{co.finances?.hasBankAccount ? 'Oui' : 'Non'}</Badge>}
                    />
                    <InfoRow label="Avez-vous déjà accédé à un crédit bancaire ?"
                        value={<Badge color={co.finances?.hasBankCredit ? 'success' : 'default'} variant="flat">{co.finances?.hasBankCredit ? 'Oui' : 'Non'}</Badge>}
                    />
                    {co.finances?.hasBankCredit && (
                        <InfoRow label="Montant du crédit bancaire obtenu (BIF)"
                            value={`${Number(co.finances.bankCreditAmount).toLocaleString('fr-FR')} BIF`}
                        />
                    )}
                </div>
            </FormGroup>

            {/* Impact social */}
            {/* <FormGroup title="Impact social" description="Caractéristiques de l'entreprise" className="@3xl:grid-cols-12">
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <InfoRow label="Dirigée par une femme"
                        value={<Badge color={co.socialImpact?.isLedByWoman ? 'success' : 'default'} variant="flat">{co.socialImpact?.isLedByWoman ? 'Oui' : 'Non'}</Badge>}
                    />
                    <InfoRow label="Dirigée par un réfugié"
                        value={<Badge color={co.socialImpact?.isLedByRefugee ? 'success' : 'default'} variant="flat">{co.socialImpact?.isLedByRefugee ? 'Oui' : 'Non'}</Badge>}
                    />
                    <InfoRow label="Impact climatique positif"
                        value={<Badge color={co.socialImpact?.hasPositiveClimateImpact ? 'success' : 'default'} variant="flat">{co.socialImpact?.hasPositiveClimateImpact ? 'Oui' : 'Non'}</Badge>}
                    />
                </div>
            </FormGroup> */}
        </div>
    );
}