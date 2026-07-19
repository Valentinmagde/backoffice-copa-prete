// Secteurs et sous-secteurs d'activité du projet (étape 3 de la candidature MPME).
// Miroir de PROJECT_SECTOR_GROUPS côté client-copa-prete (src/pages/Application.tsx) —
// garder les deux synchronisés si la taxonomie évolue.

export const PROJECT_SECTOR_GROUPS: {
  group: string;
  items: { value: string; label: string }[];
}[] = [
  {
    group: 'Agribusiness/Agro-industrie',
    items: [
      { value: 'agri_animalFeed', label: 'Aliment bétail' },
      { value: 'agri_beekeeping', label: 'Apiculture' },
      { value: 'agri_wood', label: 'Bois' },
      { value: 'agri_sugarcane', label: 'Canne à sucre' },
      { value: 'agri_cereal', label: 'Céréale' },
      { value: 'agri_mushroom', label: 'Champignon' },
      { value: 'agri_cosmetic', label: 'Cosmétique' },
      { value: 'agri_waste', label: 'Déchet' },
      { value: 'agri_tropicalFruit', label: 'Fruits tropicaux' },
      { value: 'agri_milk', label: 'Lait' },
      { value: 'agri_vegetable', label: 'Légume' },
      { value: 'agri_legume', label: 'Légumineuse' },
      { value: 'agri_palmOil', label: 'Palmier à huile' },
      { value: 'agri_fishFarming', label: 'Pisciculture' },
      { value: 'agri_tuber', label: 'Tubercule' },
      { value: 'agri_poultry', label: 'Volaille' },
      { value: 'agri_other', label: 'Autre sous-secteur/A préciser' },
    ],
  },
  {
    group: 'Industrie minière',
    items: [
      { value: 'mining_compressedEarthBricks', label: 'Briques de Terre Compressée (BTC)' },
      { value: 'mining_ornamentalStones', label: 'Pierres ornementales' },
      { value: 'mining_gold', label: 'Or' },
      { value: 'mining_3tMinerals', label: 'Minerais 3T (Étain, Tungstène, Tantale)' },
      { value: 'mining_rareEarths', label: 'Terres rares' },
      { value: 'mining_other', label: 'Autre sous-secteur/A préciser' },
    ],
  },
  {
    group: 'Tourisme & SPA',
    items: [
      { value: 'tourism_culturalHistorical', label: 'Tourisme culturel et historique' },
      { value: 'tourism_nauticalCoastal', label: 'Activités nautiques et balnéaires' },
      { value: 'tourism_touristCircuits', label: 'Circuits touristiques' },
      { value: 'tourism_spaWellness', label: 'SPA et bien être' },
      { value: 'tourism_specializedGuide', label: 'Guide touristique spécialisé' },
      { value: 'tourism_traditionalCuisine', label: 'Restauration valorisant les mets traditionnels' },
      { value: 'tourism_other', label: 'Autre sous-secteur/A préciser' },
    ],
  },
  {
    group: 'Numérique & Technologie',
    items: [
      { value: 'tech_smartAgriculture', label: 'Technologie de smart agriculture' },
      { value: 'tech_plantSensors', label: 'Capteur et santé des plantes' },
      { value: 'tech_plantCareTech', label: 'Technologie entretien des plantes' },
      { value: 'tech_weatherTraceability', label: 'Technologie météo & traçabilité' },
      { value: 'tech_other', label: 'Autre sous-secteur/A préciser' },
    ],
  },
];

export const PROJECT_SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  PROJECT_SECTOR_GROUPS.flatMap((g) => g.items.map((i) => [i.value, i.label])),
);

export const PROJECT_SECTOR_OPTIONS = PROJECT_SECTOR_GROUPS.flatMap((g) =>
  g.items.map((i) => ({ value: i.value, label: `${g.group} — ${i.label}` })),
);
