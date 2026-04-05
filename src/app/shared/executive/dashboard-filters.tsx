'use client';

import { useState } from 'react';
import { Select, Input, Button } from 'rizzui';
import cn from '@core/utils/class-names';

const sectorOptions = [
  { label: 'Tous les secteurs', value: 'all' },
  { label: 'Technologie', value: 'tech' },
  { label: 'Santé', value: 'health' },
  { label: 'Éducation', value: 'education' },
  { label: 'Finance', value: 'finance' },
  { label: 'Retail', value: 'retail' },
];

const statusOptions = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'Enregistré', value: 'Registered' },
  { label: 'En attente', value: 'Pending' },
  { label: 'Validé', value: 'Validated' },
  { label: 'Rejeté', value: 'Rejected' },
];

const periodOptions = [
  { label: 'Dernier mois', value: '1m' },
  { label: 'Dernier trimestre', value: '3m' },
  { label: 'Dernière année', value: '1y' },
  { label: 'Tout le temps', value: 'all' },
];

export default function DashboardFilters() {
  const [sector, setSector] = useState('all');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState('1m');
  const [search, setSearch] = useState('');

  const handleReset = () => {
    setSector('all');
    setStatus('all');
    setPeriod('1m');
    setSearch('');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @2xl:grid-cols-5 @4xl:gap-5">
        {/* Recherche */}
        <Input
          placeholder="Rechercher une candidature..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="@2xl:col-span-1"
        />

        {/* Filtre secteur */}
        <Select
          options={sectorOptions}
          value={sector}
          onChange={setSector}
          displayValue={(selected) =>
            sectorOptions.find((opt) => opt.value === selected)?.label
          }
          className="w-full"
        />

        {/* Filtre statut */}
        <Select
          options={statusOptions}
          value={status}
          onChange={setStatus}
          displayValue={(selected) =>
            statusOptions.find((opt) => opt.value === selected)?.label
          }
          className="w-full"
        />

        {/* Filtre période */}
        <Select
          options={periodOptions}
          value={period}
          onChange={setPeriod}
          displayValue={(selected) =>
            periodOptions.find((opt) => opt.value === selected)?.label
          }
          className="w-full"
        />

        {/* Bouton reset */}
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full"
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
