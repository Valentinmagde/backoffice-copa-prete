// app/shared/executive/social-followers.tsx
'use client';

import { Text } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import {
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  YAxis,
  BarChart,
  XAxis,
  Bar,
} from 'recharts';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { formatNumber } from '@core/utils/format-number';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { useMedia } from '@core/hooks/use-media';
import { useCandidatesBySector } from '@/lib/api/hooks/use-dashboard';

// Supprimer l'import des icônes qui cause l'erreur
// Ne pas utiliser d'icônes complexes

export default function SocialFollowers({ className }: { className?: string }) {
  const isSM = useMedia('(max-width: 640px)', false);
  const isMobile = useMedia('(max-width: 767px)', false);
  const isTab = useMedia('(min-width: 768px)', false);
  const isLg = useMedia('(min-width: 1024px)', false);
  const is2XL = useMedia('(min-width: 1780px)', false);
  const { data: secteurs, isLoading } = useCandidatesBySector();

  if (isLoading || !secteurs) {
    return (
      <WidgetCard title="Candidatures par secteur" className={className}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  function barSize() {
    if (is2XL) return 24;
    if (isLg || isMobile) return 32;
    if (isTab) return 40;
    return 28;
  }

  // Fonction pour formater les valeurs
  const formaterValeur = (valeur: number | undefined | null): string => {
    if (valeur === undefined || valeur === null || isNaN(valeur)) return '0';
    return valeur.toLocaleString();
  };

  // Préparer les données pour le graphique
  const donneesGraphique = secteurs.map(secteur => ({
    secteur: secteur.sector === 'Non spécifié' ? 'Non spécifié' : secteur.sector,
    total: secteur.total || 0,
    femmes: secteur.women || 0,
    hommes: secteur.men || 0,
    refugies: secteur.refugees || 0,
  }));

  const totalCandidatures = secteurs.reduce((sum, s) => sum + (s.total || 0), 0);

  // Données pour la légende (sans icônes)
  const legendes = [
    { nom: 'Total', couleur: '#3b82f6' },
    { nom: 'Femmes', couleur: '#ec489a' },
    { nom: 'Hommes', couleur: '#10b981' },
    { nom: 'Réfugiés', couleur: '#f59e0b' },
  ];

  return (
    <WidgetCard
      title="Candidatures par secteur"
      titleClassName="font-medium sm:text-lg text-gray-800 mb-2.5 font-inter"
      className={className}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className="my-8 h-[300px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isSM && { minWidth: '500px' })}
          >
            <BarChart
              data={donneesGraphique}
              margin={{ left: -15 }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis dataKey="secteur" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={({ payload, ...rest }) => {
                  const pl = {
                    ...payload,
                    value: formatNumber(Number(payload.value)),
                  };
                  return <CustomYAxisTick payload={pl} {...rest} />;
                }}
              />
              <Tooltip content={<CustomTooltip formattedNumber />} />
              <Bar barSize={barSize()} dataKey="total" fill="#3b82f6" name="Total" />
              <Bar barSize={barSize()} dataKey="femmes" fill="#ec489a" name="Femmes" />
              <Bar barSize={barSize()} dataKey="hommes" fill="#10b981" name="Hommes" />
              <Bar barSize={barSize()} dataKey="refugies" fill="#f59e0b" name="Réfugiés" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Légende avec couleurs seulement - sans icônes */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-4 pb-4 border-b border-muted">
        {legendes.map((item) => (
          <div key={item.nom} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.couleur }}
            />
            <span className="text-sm text-gray-600">{item.nom}</span>
          </div>
        ))}
      </div>

      {/* Tableau récapitulatif */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-muted pb-4 font-medium">
          <Text as="span" className="text-sm text-gray-600 dark:text-gray-700">
            Total candidatures
          </Text>
          <Text as="span" className="font-bold text-lg">{formaterValeur(totalCandidatures)}</Text>
        </div>

        {/* Détails par catégorie */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Femmes</Text>
            <Text className="text-xl font-semibold text-pink-600">
              {formaterValeur(secteurs.reduce((sum, s) => sum + (s.women || 0), 0))}
            </Text>
          </div>
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Hommes</Text>
            <Text className="text-xl font-semibold text-green-600">
              {formaterValeur(secteurs.reduce((sum, s) => sum + (s.men || 0), 0))}
            </Text>
          </div>
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Réfugiés</Text>
            <Text className="text-xl font-semibold text-amber-600">
              {formaterValeur(secteurs.reduce((sum, s) => sum + (s.refugees || 0), 0))}
            </Text>
          </div>
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Secteurs représentés</Text>
            <Text className="text-xl font-semibold text-blue-600">
              {donneesGraphique.filter(s => s.total > 0).length}
            </Text>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}