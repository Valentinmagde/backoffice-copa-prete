'use client';

import { PiLightbulb, PiTarget, PiChartBar, PiUsers, PiTree, PiHeart, PiCurrencyDollar } from 'react-icons/pi';
import FormGroup from '@/app/shared/form-group';
import { Text, Badge } from 'rizzui';

interface ProjectInfoTabProps {
    data: any;
}

export default function ProjectInfoTab({ data }: ProjectInfoTabProps) {
    const project = data.project;

    if (!project) {
        return (
            <div className="py-10 text-center">
                <Text className="text-gray-500">Aucune information de projet disponible</Text>
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

    const formatMoney = (amount: number) => {
        if (!amount) return 'Non renseigné';
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(amount);
    };

    const sectorLabels: Record<string, string> = {
        agriculture: 'Agriculture',
        milk: 'Lait',
        poultry: 'Volaille',
        fish: 'Pêche',
        tropicalFruit: 'Fruits tropicaux',
        otherAgro: 'Autre agroalimentaire',
        mining: 'Mines',
        tourism: 'Tourisme',
        other: 'Autre',
    };

    return (
        <>
            <FormGroup
                title="Présentation du projet"
                description="Détails du projet soumis"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
                {/* Description du projet */}
                <div>
                    <InfoRow label="Titre du projet" value={project.title} icon={PiLightbulb} />
                    <InfoRow label="Objectif du projet" value={project.objective} icon={PiTarget} />
                    <InfoRow label="Secteurs d'activité" value={project.sectors?.map((s: string) => sectorLabels[s] || s).join(', ')} icon={PiChartBar} />
                    {project.otherSector && (
                        <InfoRow label="Autre secteur" value={project.otherSector} icon={PiChartBar} />
                    )}
                </div>

                {/* Activités */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Activités et produits</h4>
                    <InfoRow label="Activités principales" value={project.mainActivities} icon={PiUsers} />
                    <InfoRow label="Produits/Services" value={project.productsServices} icon={PiUsers} />
                    <InfoRow label="Origine de l'idée" value={project.businessIdea} icon={PiLightbulb} />
                </div>

                {/* Marché */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Marché et clients</h4>
                    <InfoRow label="Clients cibles" value={project.targetClients} icon={PiTarget} />
                    <InfoRow label="Périmètre clients" value={project.clientScope?.map((s: string) => {
                        const scopeMap: Record<string, string> = {
                            local: 'Local',
                            national: 'National',
                            eastAfrica: 'Afrique de l\'Est',
                            international: 'International',
                        };
                        return scopeMap[s] || s;
                    }).join(', ')} icon={PiTarget} />
                    <InfoRow label="Concurrents" value={project.competition?.hasCompetitors ? 'Oui' : 'Non'} icon={PiTarget} />
                    {project.competition?.hasCompetitors && (
                        <InfoRow label="Noms des concurrents" value={project.competition.competitorNames} icon={PiTarget} />
                    )}
                </div>

                {/* Employés prévus */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Employés prévus</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoRow label="Employés femmes" value={project.plannedEmployees?.female} icon={PiUsers} />
                        <InfoRow label="Employés hommes" value={project.plannedEmployees?.male} icon={PiUsers} />
                        <InfoRow label="Employés permanents" value={project.plannedEmployees?.permanent} icon={PiUsers} />
                        <InfoRow label="Employés réfugiés" value={project.plannedEmployees?.refugee} icon={PiUsers} />
                        <InfoRow label="Employés Batwa" value={project.plannedEmployees?.batwa} icon={PiUsers} />
                        <InfoRow label="Employés handicapés" value={project.plannedEmployees?.disabled} icon={PiUsers} />
                    </div>
                </div>

                {/* Innovation */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Innovation</h4>
                    <InfoRow label="Idée innovante" value={project.innovation?.isNewIdea ? 'Oui' : 'Non'} icon={PiLightbulb} />
                    {project.innovation?.isNewIdea && (
                        <InfoRow label="Idée testée" value={project.innovation?.ideaTested ? 'Oui' : 'Non'} icon={PiLightbulb} />
                    )}
                </div>

                {/* Impact */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Impact</h4>
                    <InfoRow label="Actions climatiques" value={project.impact?.climateActions} icon={PiTree} />
                    <InfoRow label="Actions d'inclusion" value={project.impact?.inclusionActions} icon={PiHeart} />
                </div>

                {/* Financement */}
                <div className="pt-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Financement</h4>
                    <InfoRow label="Coût estimé" value={project.financing?.hasEstimatedCost ? 'Oui' : 'Non'} icon={PiCurrencyDollar} />
                    {project.financing?.hasEstimatedCost && (
                        <>
                            <InfoRow label="Coût total du projet" value={formatMoney(project.financing?.totalCost)} icon={PiCurrencyDollar} />
                            <InfoRow label="Montant de subvention demandé" value={formatMoney(project.financing?.requestedSubsidy)} icon={PiCurrencyDollar} />
                            <InfoRow label="Principales dépenses" value={project.financing?.mainExpenses} icon={PiCurrencyDollar} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}