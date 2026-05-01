'use client';

import { useState, useEffect } from 'react';
import { Input, Select, Button } from 'rizzui';
import { PiMagnifyingGlass, PiXBold } from 'react-icons/pi';

const channelOptions = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'SMS',   value: 'SMS' },
  { label: 'In-App', value: 'IN_APP' },
];

const typeOptions = [
  { label: 'Présélection', value: 'PRESELECTION' },
  { label: 'Rejet', value: 'REJECTION' },
];

const statusOptions = [
  { label: 'Envoyé', value: 'SENT' },
  { label: 'Échoué', value: 'FAILED' },
];

export default function NotificationsFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: {
  filters?: any;
  onFilterChange?: (f: any) => void;
  onResetFilters?: () => void;
}) {
  const [search, setSearch] = useState(filters?.search || '');
  const [channelFilter, setChannelFilter] = useState(filters?.channel || '');
  const [typeFilter, setTypeFilter] = useState(filters?.type || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');

  useEffect(() => {
    setSearch(filters?.search || '');
    setChannelFilter(filters?.channel || '');
    setTypeFilter(filters?.type || '');
    setStatusFilter(filters?.status || '');
  }, [filters]);

  const handleSearch = (value: string) => {
    setSearch(value);
    onFilterChange?.({ ...filters, search: value });
  };

  const handleTypeChange = (type: { label: string, value: string }) => {
    setTypeFilter(type);
    onFilterChange?.({ ...filters, type });
  };

  const handleStatusChange = (status: { label: string, value: string }) => {
    setStatusFilter(status);
    onFilterChange?.({ ...filters, status });
  };

  const handleReset = () => {
    setSearch('');
    setChannelFilter('');
    setTypeFilter('');
    setStatusFilter('');
    onResetFilters?.();
  };

  const hasFilters = search || channelFilter || typeFilter || statusFilter;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Input
        prefix={<PiMagnifyingGlass className="size-4 text-gray-400" />}
        placeholder="Rechercher un candidat, email, code..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full sm:w-72"
      />
      <Select
        placeholder="Canal"
        options={channelOptions}
        value={channelFilter}
        onChange={(v: any) => { const val = v?.value ?? v; setChannelFilter(val); onFilterChange?.({ ...filters, channel: val }); }}
        className="w-36"
        getOptionValue={(o) => o.value}
        displayValue={(s) => channelOptions.find(o => o.value === s)?.label ?? ''}
      />
      <Select
        placeholder="Type"
        options={typeOptions}
        value={typeFilter}
        onChange={handleTypeChange}
        className="w-44"
        getOptionValue={(option) => option.value}
        displayValue={(selected) => {
          console.log(selected);
          const option = typeOptions.find((opt) => opt.value === selected);
          console.log(option, selected, typeFilter);
          return option?.label ?? '';
        }}
      />
      <Select
        placeholder="Statut"
        options={statusOptions}
        value={statusFilter}
        onChange={(v: any) => handleStatusChange(v)}
        className="w-44"
        getOptionValue={(option) => option.value}
        displayValue={(selected) => {
          const option = statusOptions.find((opt) => opt.value === selected);
          return option?.label ?? '';
        }}
      />
      {hasFilters && (
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <PiXBold className="size-3" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}