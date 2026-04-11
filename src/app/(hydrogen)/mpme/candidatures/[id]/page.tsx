'use client';

import { use } from 'react';
import { Loader, Text, Badge } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import { useMPMECandidature } from '@/lib/api/hooks/use-mpme';
import {
    PiUser, PiEnvelope, PiPhone, PiMapPin,
    PiGenderIntersex, PiCalendar, PiBriefcase,
} from 'react-icons/pi';

function InfoRow({ label, value, icon: Icon }: {
    label: string;
    value?: string | null;
    icon?: any;
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

function InfoRowBlock({ label, value }: { label: string; value?: any }) {
    return (
        <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
            <Text className="text-sm font-medium tracking-wider text-gray-500">{label}</Text>
            <Text className="text-sm text-gray-800">{value ?? '—'}</Text>
        </div>
    );
}

function BooleanRow({ label, value }: { label: string; value?: boolean | null }) {
    return (
        <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
            <Text className="text-sm font-medium tracking-wider text-gray-500">{label}</Text>
            {value === null || value === undefined ? (
                <Text className="text-sm text-gray-800">{value ?? '—'}</Text>
            ) : (
                <Text className="text-sm text-gray-800"><Badge color={value === false ? 'danger' : 'success'} variant="flat">
                    {value ? 'Oui' : 'Non'}
                </Badge></Text>
            )}
        </div>
    );
}


export default function PersonalInfoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: b, isLoading } = useMPMECandidature(Number(id));

    if (isLoading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader variant="spinner" size="lg" />
        </div>
    );

    if (!b) return (
        <div className="flex h-64 items-center justify-center">
            <Text className="text-gray-500">Candidature introuvable</Text>
        </div>
    );

    const address = b.user?.primaryAddress;

    const mapGender = (code: string) => {
        switch (code) {
            case 'M': return 'Homme';
            case 'F': return 'Femme';
            default: return '—';
        }
    };

    const mapMaritalStatus = (code: string | null) => {
        switch (code) {
            case 'single': return 'Célibataire';
            case 'married': return 'Marié(e)';
            case 'divorced': return 'Divorcé(e)';
            case 'widowed': return 'Veuf(ve)';
            default: return '—';
        }
    };

    const mapEducationLevel = (code: string | null) => {
        switch (code) {
            case 'none': return 'Non scolarisé(e)';
            case 'primary': return 'Primaire';
            case 'secondary': return 'Secondaire';
            case 'university': return 'Universitaire';
            default: return '—';
        }
    };

    return (
        <div className="@container space-y-8">
            {/* Identité */}
            <FormGroup
                title="Identité"
                description="Informations personnelles du/de la représentant/représentante légal.e de l'entreprise (mpme) ou de la coopérative candidate"
                className="@3xl:grid-cols-12"
            >
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <InfoRow icon={PiUser} label="Prénom" value={b.user?.firstName} />
                    <InfoRow icon={PiUser} label="Nom" value={b.user?.lastName} />
                    <InfoRow icon={PiEnvelope} label="Adresse e-mail" value={b.user?.email} />
                    <InfoRow icon={PiPhone} label="Numéro de téléphone" value={b.user?.phoneNumber} />
                    <InfoRow icon={PiCalendar} label="Date de naissance"
                        value={b.user?.birthDate ? new Date(b.user.birthDate).toLocaleDateString('fr-FR') : null}
                    />
                    <InfoRow icon={PiGenderIntersex} label="Genre" value={mapGender(b.user?.gender?.code)} />
                    <InfoRow icon={PiBriefcase} label="Fonction au sein de l'entreprise" value={b.position} />
                    <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200">
                        <Text className="text-sm text-gray-500">Statut</Text>
                        <Badge color={b.category === 'REFUGEE' ? 'warning' : 'primary'} variant="flat">
                            {b.category === 'REFUGEE' ? 'Réfugié' : 'Burundais'}
                        </Badge>
                    </div>
                    <InfoRow label="État civil" value={mapMaritalStatus(b.maritalStatus)} />
                    <InfoRow label="Niveau d'étude" value={mapEducationLevel(b.educationLevel)} />
                </div>
            </FormGroup>

            {/* Adresse */}
            <FormGroup
                title="Adresse"
                description="Localisation du/de la représentant/représentante légal.e de l'entreprise (mpme) ou de la coopérative candidate"
                className="@3xl:grid-cols-12"
            >
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <InfoRow icon={PiMapPin} label="Province" value={address?.province} />
                    <InfoRow icon={PiMapPin} label="Commune" value={address?.commune} />
                    <InfoRow label="Quartier/Colline" value={address?.neighborhood} />
                    <InfoRow label="Zone/Avenue" value={address?.street} />
                </div>
            </FormGroup>

            {/* Questions d'éligibilité */}
            <FormGroup
                title="Déclaration de cas de conflit d’Intérêt"
                description="Informations déclaratives et autorisation de vérification par l’équipe projet"
                className="@3xl:grid-cols-12"
            >
                <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
                    <BooleanRow label="Êtes-vous présentement en fonction dans l’administration publique ou en contrat dans le cadre d’un projet financé par des bailleurs de fonds multilatéraux ou bilatéraux ?" value={b.eligibilityQuestions?.isPublicServant} />
                    <BooleanRow label="Êtes-vous la/le conjoint(e), l’ascendant(e) ou le/la descendant(e) direct(e) d’une personne qui travaille dans l’administration publique ou en contrat dans le cadre d’un projet financé par des bailleurs de fonds multilatéraux ou bilatéraux ?" value={b.eligibilityQuestions?.isRelativeOfPublicServant} />
                    <BooleanRow label="Êtes-vous stagiaire dans l’administration publique à la date de soumission de votre candidature ?" value={b.eligibilityQuestions?.isPublicIntern} />
                    <BooleanRow label="Êtes-vous la/le conjoint(e), l’ascendant(e) ou le/la descendant(e) direct(e) d’un stagiaire dans l’administration publique à la date de soumission de votre candidature ?" value={b.eligibilityQuestions?.isRelativeOfPublicIntern} />
                    <BooleanRow label="Avez-vous été Président, Premier ministre, ministre, Député les cinq dernières années ?" value={b.eligibilityQuestions?.wasHighOfficer} />
                    <BooleanRow label="Êtes-vous ou avez-vous été la/le conjoint(e), l’ascendant(e) ou le/la descendant(e) direct(e) d’un Président, Premier ministre, ministres, Député actuellement ou pendant les cinq dernières années ?" value={b.eligibilityQuestions?.isRelativeOfHighOfficer} />
                    <BooleanRow label="Avez-vous un lien professionnel ou familial étroit avec l’Unité de Gestion du Projet (UGP) pour l’Emploi et la Transformation Économique (PRETE Nyunganira), l'équipe du COPA, le Comité de sélection ou une entité leur étant affiliée ?" value={b.eligibilityQuestions?.hasProjectLink} />
                    <BooleanRow label="Êtes-vous fournisseur direct ou réalisez-vous des travaux autres que les activités dont bénéficieront les subventions du COPA à un membre ou plusieurs membres de l’Unité de Gestion du Projet ou du Comité de sélection ?" value={b.eligibilityQuestions?.isDirectSupplierToProject} />
                    <BooleanRow label="L'entreprise ou son/sa représentant/Représentante légal.e ont il déjà bénéficié d'une subvention similaire durant les 5 dernières années ?" value={b.eligibilityQuestions?.hasPreviousGrant} />
                    {b.eligibilityQuestions?.hasPreviousGrant && (
                        <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
                            <Text className="text-sm font-medium tracking-wider text-gray-400">Précisez le projet ou l'organisme concerné</Text>
                            <Text className="text-sm text-gray-800 text-justify">{b.eligibilityQuestions?.previousGrantDetails ?? '—'}</Text>
                        </div>
                    )}
                    {/* {b.eligibilityQuestions?.hasPreviousGrant && (
                        <InfoRow label="Précisez le projet ou l'organisme concerné" value={b.eligibilityQuestions?.previousGrantDetails} />
                    )} */}
                </div>
            </FormGroup>
        </div>
    );
}