// app/shared/executive/biggest-deal.tsx
'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import { useCompanyStatusAnalysis } from '@/lib/api/hooks/use-dashboard';

const COULEURS_STATUT_ENTREPRISE: Record<string, string> = {
    'formal': '#3b82f6',   // Bleu pour formel
    'informal': '#f59e0b', // Orange pour informel
};

const libellesStatutEntreprise: Record<string, string> = {
    'formal': 'Formel',
    'informal': 'Informel',
};

// Fonction utilitaire pour formater les valeurs
const formaterValeur = (valeur: number | undefined | null): string => {
    if (valeur === undefined || valeur === null || isNaN(valeur)) return '0';
    return valeur.toLocaleString();
};

function CustomLabel(props: any) {
    const { cx, cy, total } = props;

    if (isNaN(cx) || isNaN(cy)) {
        return null;
    }

    const totalValide = !isNaN(total) ? total : 0;

    return (
        <>
            <text
                x={cx}
                y={cy - 20
                }
                fill="#666666"
                className="recharts-text recharts-label"
                textAnchor="middle"
                dominantBaseline="central"
            >
                <tspan fontSize="14px" > Total </tspan>
            </text>
            < text
                x={cx}
                y={cy + 20}
                fill="#111111"
                className="recharts-text recharts-label"
                textAnchor="middle"
                dominantBaseline="central"
            >
                <tspan alignmentBaseline="middle" fontSize="36px" fontWeight={700} >
                    {totalValide}
                </tspan>
            </text>
            < text
                x={cx}
                y={cy + 50}
                fill="#666666"
                className="recharts-text recharts-label"
                textAnchor="middle"
                dominantBaseline="central"
            >
                <tspan fontSize="12px" > entreprises </tspan>
            </text>
        </>
    );
}

export default function CompanyStatusAnalysis({ className }: { className?: string }) {
    const { data: analyse, isLoading } = useCompanyStatusAnalysis();

    if (isLoading || !analyse) {
        return (
            <WidgetCard title="Répartition par statut d'entreprise" className={className} >
                <div className="h-96 flex items-center justify-center" >
                    <div className="animate-pulse text-gray-400" > Chargement...</div>
                </div>
            </WidgetCard>
        );
    }

    // Transformer les données
    const donneesGraphique = analyse.map(item => ({
        nom: libellesStatutEntreprise[item.status] || item.status,
        valeur: !isNaN(item.count) ? item.count : 0,
        pourcentage: !isNaN(item.percentage) ? item.percentage : 0,
        couleur: COULEURS_STATUT_ENTREPRISE[item.status] || '#94a3b8',
    }));

    // Calculer le total
    const total = donneesGraphique.reduce((sum, item) => sum + (isNaN(item.valeur) ? 0 : item.valeur), 0);
    const totalValide = !isNaN(total) ? total : 0;

    if (totalValide === 0) {
        return (
            <WidgetCard title="Répartition par statut d'entreprise" className={className} >
                <div className="flex items-center justify-center h-80" >
                    <Text className="text-gray-400" > Aucune donnée d'entreprise disponible</Text>
                </div>
            </WidgetCard>
        );
    }

    return (
        <WidgetCard
            title="Répartition par statut d'entreprise"
            titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
            className={className}
            description={
                < div className="flex items-center justify-start" >
                    <Title as="h2" className="me-2" >
                        {formaterValeur(totalValide)}
                    </Title>
                    < Text className="flex items-center leading-none text-gray-500" >
                        <Text
                            as="span"
                            className={
                                cn(
                                    'me-2 inline-flex items-center font-medium text-green'
                                )
                            }
                        >
                            <TrendingUpIcon className="me-1 h-4 w-4" />
                            entreprises
                        </Text>
                    </Text>
                </div>
            }
        >
            <>
                <div className="relative h-[319px] w-full" >
                    <ResponsiveContainer width="100%" height="100%" >
                        <PieChart className="[&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white" >
                            <Pie
                                data={donneesGraphique}
                                dataKey="valeur"
                                nameKey="nom"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                label={({ nom, percent }) => {
                                    const pourcentage = !isNaN(percent) ? percent * 100 : 0;
                                    return `${nom} (${pourcentage.toFixed(0)}%)`;
                                }}
                                paddingAngle={5}
                            >
                                {
                                    donneesGraphique.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.couleur} />
                                    ))}
                                <Label
                                    width={30}
                                    position="center"
                                    content={< CustomLabel total={totalValide} />}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                < div >
                    <div className="mb-4 flex items-center justify-between border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0" >
                        <Text as="span" className="text-sm text-gray-600 dark:text-gray-700" >
                            Statut d'entreprise
                        </Text>
                        < Text as="span" > Nombre </Text>
                    </div>
                    {
                        donneesGraphique.map((item) => (
                            <div
                                key={item.nom}
                                className="mb-4 flex items-center justify-between border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center justify-start gap-2" >
                                    <span
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: item.couleur }}
                                    />
                                    < Text
                                        as="span"
                                        className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700"
                                    >
                                        {item.nom}
                                    </Text>
                                </div>
                                < Text as="span" > {formaterValeur(item.valeur)} </Text>
                            </div>
                        ))}
                </div>
            </>
        </WidgetCard>
    );
}