// app/shared/executive/mrr-report.tsx
'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useGenderCategoryAnalysis } from '@/lib/api/hooks/use-dashboard';
import { useMedia } from 'react-use';

const COULEURS_GENRE = ['#ec489a', '#3b82f6'];
const COULEURS_CATEGORIE = ['#10b981', '#f59e0b'];

// Fonction utilitaire pour formater les valeurs
const formaterValeur = (valeur: number | undefined | null): string => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return '0';
  return valeur.toLocaleString();
};

export default function MRRReport({ className }: { className?: string }) {
  const { data: analyse, isLoading } = useGenderCategoryAnalysis();
  const isSM = useMedia('(max-width: 640px)', false);

  if (isLoading) {
    return (
      <WidgetCard title="Analyse par genre et catégorie" className={className}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </WidgetCard>
    );
  }

  // Vérifier si les données existent
  const donneesGenre = analyse?.genderData || [];
  const donneesCategorie = analyse?.categoryData || [];

  // Extraire les totaux pour l'affichage
  const totalFemmes = donneesGenre.find(item => item.gender === 'Femmes' || item.gender === 'F')?.count || 0;
  const totalHommes = donneesGenre.find(item => item.gender === 'Hommes' || item.gender === 'M')?.count || 0;
  const totalRefugies = donneesCategorie.find(item => item.category === 'Réfugiés' || item.category === 'REFUGEE')?.count || 0;
  const totalBurundais = donneesCategorie.find(item => item.category === 'Burundais' || item.category === 'BURUNDIAN')?.count || 0;

  // Calculer le total général
  const totalGenre = donneesGenre.reduce((sum, item) => {
    const val = item.count || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalCategorie = donneesCategorie.reduce((sum, item) => {
    const val = item.count || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalCandidats = totalGenre;

  // Afficher un message si pas de données
  if (totalCandidats === 0) {
    return (
      <WidgetCard
        title="Analyse par genre et catégorie"
        titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
        className={className}
        description={
          <div className="flex items-center justify-start">
            <Title as="h2" className="me-2 font-semibold">
              0
            </Title>
            <Text className="flex items-center leading-none text-gray-500">
              <Text
                as="span"
                className={cn(
                  'me-2 inline-flex items-center font-medium text-green'
                )}
              >
                <TrendingUpIcon className="me-1 h-4 w-4" />
                total
              </Text>
            </Text>
          </div>
        }
      >
        <div className="flex items-center justify-center h-80">
          <Text className="text-gray-400">Aucune donnée disponible</Text>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Analyse par genre et statut d'entrepreneur"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      className={className}
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2 font-semibold">
            {formaterValeur(totalCandidats)}
          </Title>
          <Text className="flex items-center leading-none text-gray-500">
            <Text
              as="span"
              className={cn(
                'me-2 inline-flex items-center font-medium text-green'
              )}
            >
              <TrendingUpIcon className="me-1 h-4 w-4" />
              candidats
            </Text>
          </Text>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-4">
        {/* Graphique genre */}
        <div className='my-8 h-[300px]'>
          <Text className="text-sm text-center font-medium text-gray-600 mb-3">
            Répartition par genre
            {/* ({formaterValeur(totalGenre)}) */}
          </Text>
          {donneesGenre.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donneesGenre}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${formaterValeur(value)} candidats`, 'Nombre']} />
                <Bar dataKey="count" fill="#ec489a" name="Nombre">
                  {donneesGenre.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COULEURS_GENRE[index % COULEURS_GENRE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
              <Text className="text-gray-400 text-sm">Aucune donnée de genre</Text>
            </div>
          )}
        </div>

        {/* Graphique catégorie */}
        <div className='my-8 h-[300px]'>
          <Text className="text-sm text-center font-medium text-gray-600 mb-3">
            Répartition par statut d'entrepreneur
            {/* ({formaterValeur(totalCategorie)}) */}
          </Text>
          {donneesCategorie.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donneesCategorie}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${formaterValeur(value)} candidats`, 'Nombre']} />
                <Bar dataKey="count" fill="#10b981" name="Nombre">
                  {donneesCategorie.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COULEURS_CATEGORIE[index % COULEURS_CATEGORIE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
              <Text className="text-gray-400 text-sm">Aucune donnée de catégorie</Text>
            </div>
          )}
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-muted pb-4 font-medium">
          <Text as="span" className="text-sm text-gray-600 dark:text-gray-700">
            Total
          </Text>
         {/*  <Text as="span" className="font-bold text-lg">{formaterValeur(totalFemmes)}</Text> */}
        </div>

        {/* Détails par catégorie */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Femmes</Text>
            <Text className="text-xl font-semibold text-pink-600">
              {formaterValeur(totalFemmes)}
            </Text>
          </div>
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Hommes</Text>
            <Text className="text-xl font-semibold text-green-600">
              {formaterValeur(totalHommes)}
            </Text>
          </div>
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Réfugiés</Text>
            <Text className="text-xl font-semibold text-amber-600">
              {formaterValeur(totalRefugies)}
            </Text>
          </div>
          <div className="space-y-2">
            <Text className="text-xs text-gray-400">Burundais</Text>
            <Text className="text-xl font-semibold text-blue-600">
              {totalBurundais}
            </Text>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}