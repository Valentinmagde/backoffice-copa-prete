// app/(hydrogen)/mpme/candidatures/[id]/components/company-info-tab.tsx
'use client';

import { PiBuilding, PiIdentification, PiCalendar, PiChartBar, PiUsers, PiHandshake, PiBank } from 'react-icons/pi';
import FormGroup from '@/app/shared/form-group';
import { Text, Badge } from 'rizzui';

interface CompanyInfoTabProps {
    data: any;
}

export default function CompanyInfoTab({ data }: CompanyInfoTabProps) {
    const company = data.company;

    if (!company) {
        return (
            <div className="py-10 text-center">
                <Text className="text-gray-500">Aucune information d'entreprise disponible</Text>
            </div>
        );
    }

    const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon: React.ElementType }) => {
        if (!value && value !== 0) return null;
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

    const formatDate = (date: string) => {
        if (!date) return 'Non renseigné';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatMoney = (amount: number) => {
        if (!amount) return 'Non renseigné';
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(amount);
    };

    return (
        <>
            <FormGroup
                title="Informations de l'entreprise"
                description="Détails de l'entreprise candidate"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
                {/* Informations générales */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Nom de l'entreprise" value={company.companyName} icon={PiBuilding} />
                    <InfoRow label="Type d'entreprise" value={company.companyType === 'formal' ? 'Formelle' : 'Informelle'} icon={PiBuilding} />
                    <InfoRow label="NIF" value={company.taxIdNumber} icon={PiIdentification} />
                    <InfoRow label="Forme juridique" value={company.legalStatus === 'other' ? company.legalStatusOther : company.legalStatus} icon={PiBuilding} />
                    <InfoRow label="Date de création" value={formatDate(company.creationDate)} icon={PiCalendar} />
                    <InfoRow label="Secteur d'activité" value={company.primarySector?.name || company.otherCompanySector} icon={PiChartBar} />
                </div>

                {/* Adresse entreprise */}
                {company.address && (
                    <div className="pt-4">
                        <h4 className="mb-4 text-base font-semibold text-gray-900">Adresse de l'entreprise</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InfoRow label="Province" value={company.address.province} icon={PiBuilding} />
                            <InfoRow label="Commune" value={company.address.commune} icon={PiBuilding} />
                            <InfoRow label="Quartier" value={company.address.neighborhood} icon={PiBuilding} />
                            <InfoRow label="Téléphone" value={company.companyPhone} icon={PiBuilding} />
                            <InfoRow label="Email" value={company.companyEmail} icon={PiBuilding} />
                        </div>
                    </div>
                )}

                {/* Employés */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Effectif</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoRow label="Total employés" value={company.totalEmployees} icon={PiUsers} />
                        <InfoRow label="Employés permanents" value={company.permanentEmployees} icon={PiUsers} />
                        <InfoRow label="Employés femmes" value={company.femaleEmployees} icon={PiUsers} />
                        <InfoRow label="Employés hommes" value={company.maleEmployees} icon={PiUsers} />
                        <InfoRow label="Employés réfugiés" value={company.refugeeEmployees} icon={PiUsers} />
                        <InfoRow label="Employés Batwa" value={company.batwaEmployees} icon={PiUsers} />
                        <InfoRow label="Employés handicapés" value={company.disabledEmployees} icon={PiUsers} />
                    </div>
                </div>

                {/* Associés */}
                {company.associatesCount && company.associatesCount !== 'solo' && (
                    <div className="pt-4">
                        <h4 className="mb-4 text-base font-semibold text-gray-900">Associés</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InfoRow label="Nombre d'associés" value={company.associatesCount === 'other' ? company.associatesCountOther : company.associatesCount} icon={PiUsers} />
                            <InfoRow label="Associés femmes" value={company.femalePartners} icon={PiUsers} />
                            <InfoRow label="Associés hommes" value={company.malePartners} icon={PiUsers} />
                            <InfoRow label="Associés réfugiés" value={company.refugeePartners} icon={PiUsers} />
                        </div>
                    </div>
                )}

                {/* Finances */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Informations financières</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoRow label="Chiffre d'affaires annuel" value={formatMoney(company.revenueYearN1)} icon={PiChartBar} />
                        <InfoRow label="Compte bancaire" value={company.hasBankAccount ? 'Oui' : 'Non'} icon={PiBank} />
                        <InfoRow label="Crédit bancaire" value={company.hasBankCredit ? 'Oui' : 'Non'} icon={PiBank} />
                        {company.hasBankCredit && (
                            <InfoRow label="Montant du crédit" value={formatMoney(company.bankCreditAmount)} icon={PiBank} />
                        )}
                    </div>
                </div>

                {/* Impact social */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Impact social</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoRow label="Dirigée par une femme" value={company.isLedByWoman ? 'Oui' : 'Non'} icon={PiHandshake} />
                        <InfoRow label="Dirigée par un réfugié" value={company.isLedByRefugee ? 'Oui' : 'Non'} icon={PiHandshake} />
                        <InfoRow label="Impact climatique positif" value={company.hasPositiveClimateImpact ? 'Oui' : 'Non'} icon={PiHandshake} />
                    </div>
                </div>
            </div>
        </>
    );
}