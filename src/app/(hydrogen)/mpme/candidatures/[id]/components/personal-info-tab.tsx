'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PiEnvelope, PiPhone, PiUser, PiCalendar, PiMapPin, PiGenderMale, PiHeart } from 'react-icons/pi';
import FormGroup from '@/app/shared/form-group';
import { Text, Badge } from 'rizzui';

interface PersonalInfoTabProps {
    data: any;
}

export default function PersonalInfoTab({ data }: PersonalInfoTabProps) {
    const formatDate = (date: string) => {
        if (!date) return 'Non renseigné';
        return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    };

    const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon: React.ElementType }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3 py-3 border-b border-dashed border-gray-200 last:border-0">
                <div className="flex-shrink-0 mt-1 text-gray-400">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-gray-900">{value}</p>
                </div>
            </div>
        );
    };

    const getMaritalStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            single: 'Célibataire',
            married: 'Marié(e)',
            divorced: 'Divorcé(e)',
            widowed: 'Veuf/Veuve',
        };
        return statusMap[status] || status;
    };

    const getEducationLabel = (level: string) => {
        const levelMap: Record<string, string> = {
            none: 'Aucun',
            primary: 'Primaire',
            secondary: 'Secondaire',
            university: 'Universitaire',
        };
        return levelMap[level] || level;
    };

    return (
        <>
            <FormGroup
                title="Informations personnelles"
                description="Détails du représentant légal"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Nom complet" value={`${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim()} icon={PiUser} />
                    <InfoRow label="Email" value={data.user?.email} icon={PiEnvelope} />
                    <InfoRow label="Téléphone" value={data.user?.phoneNumber} icon={PiPhone} />
                    <InfoRow label="Date de naissance" value={formatDate(data.user?.birthDate)} icon={PiCalendar} />
                    <InfoRow label="Genre" value={data.user?.gender?.code === 'M' ? 'Masculin' : 'Féminin'} icon={PiGenderMale} />
                    <InfoRow label="Situation matrimoniale" value={getMaritalStatusLabel(data.maritalStatus)} icon={PiHeart} />
                    <InfoRow label="Niveau d'instruction" value={getEducationLabel(data.educationLevel)} icon={PiUser} />
                    <InfoRow label="Fonction dans l'entreprise" value={data.position} icon={PiUser} />
                </div>

                {/* Adresse */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Adresse</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoRow label="Province" value={data.user?.primaryAddress?.province} icon={PiMapPin} />
                        <InfoRow label="Commune" value={data.user?.primaryAddress?.commune} icon={PiMapPin} />
                        <InfoRow label="Colline / Quartier" value={data.user?.primaryAddress?.neighborhood} icon={PiMapPin} />
                        <InfoRow label="Zone" value={data.user?.primaryAddress?.street} icon={PiMapPin} />
                    </div>
                </div>
            </div>
        </>
    );
}