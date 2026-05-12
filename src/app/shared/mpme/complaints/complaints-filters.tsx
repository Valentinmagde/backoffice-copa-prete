'use client';

import { type Table as ReactTableType } from '@tanstack/react-table';
import { useState } from 'react';
import { PiFunnel, PiMagnifyingGlassBold, PiTrashDuotone } from 'react-icons/pi';
import { Button, Flex, Input, Text } from 'rizzui';
import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import StatusField from '@core/components/controlled-table/status-field';
import ToggleColumns from '@core/components/table-utils/toggle-columns';
import { Complaint } from '@/lib/api/types/complaint.types';

export interface ComplaintFilters {
  search?: string;
  status?: string;
  type?: string;
}

const STATUS_OPTIONS = [
  { value: 'RECEIVED',     label: 'Reçue' },
  { value: 'UNDER_REVIEW', label: 'En cours' },
  { value: 'RESOLVED',     label: 'Résolue' },
  { value: 'REJECTED',     label: 'Rejetée' },
  { value: 'CLOSED',       label: 'Clôturée' },
];

const TYPE_OPTIONS = [
  { value: 'Technical Issue',      label: 'Problème technique' },
  { value: 'Process Irregularity', label: 'Irrégularité de sélection' },
  { value: 'Staff Misconduct',     label: 'Comportement du personnel' },
  { value: 'Corruption',           label: 'Corruption' },
  { value: 'GBV/EAS-HS',           label: 'VBG / EAS-HS' },
  { value: 'Other',                label: 'Autre' },
];

interface FiltersProps {
  table: ReactTableType<Complaint>;
  filters?: ComplaintFilters;
  onFilterChange?: (f: Partial<ComplaintFilters>) => void;
  onResetFilters?: () => void;
}

export default function ComplaintsFilters({
  table,
  filters = {},
  onFilterChange,
  onResetFilters,
}: FiltersProps) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const activeFilterCount = [filters.status, filters.type].filter(Boolean).length;

  return (
    <Flex align="center" justify="between" className="mb-4 gap-3 flex-wrap">
      <Input
        type="search"
        placeholder="Rechercher par référence, nom, description..."
        value={filters.search ?? ''}
        onClear={() => onFilterChange?.({ search: '' })}
        onChange={(e) => onFilterChange?.({ search: e.target.value })}
        inputClassName="h-9"
        clearable
        prefix={<PiMagnifyingGlassBold className="size-4" />}
        className="flex-1 max-w-lg"
      />

      <Flex align="center" gap="3">
        <Button
          variant="outline"
          onClick={() => setOpenDrawer(!openDrawer)}
          className="relative h-9 pe-3 ps-2.5"
        >
          <PiFunnel className="me-1.5 size-[18px]" strokeWidth={1.7} />
          Filtres
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <ToggleColumns table={table} />
      </Flex>

      <FilterDrawerView
        isOpen={openDrawer}
        drawerTitle="Filtres plaintes"
        setOpenDrawer={setOpenDrawer}
      >
        <div className="grid grid-cols-1 gap-5">
          <StatusField
            label="Statut"
            options={STATUS_OPTIONS}
            value={filters.status ?? []}
            onChange={(val) => onFilterChange?.({ status: val as string })}
            getOptionValue={(opt: any) => opt.value}
            getOptionDisplayValue={(opt: any) => <Text className="font-medium">{opt.label}</Text>}
            displayValue={(s: string) => (
              <Text className="font-medium">
                {STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s}
              </Text>
            )}
            dropdownClassName="!z-20"
            className="w-full"
          />

          <StatusField
            label="Type de plainte"
            options={TYPE_OPTIONS}
            value={filters.type ?? []}
            onChange={(val) => onFilterChange?.({ type: val as string })}
            getOptionValue={(opt: any) => opt.value}
            getOptionDisplayValue={(opt: any) => <Text className="font-medium">{opt.label}</Text>}
            displayValue={(s: string) => (
              <Text className="font-medium">
                {TYPE_OPTIONS.find((o) => o.value === s)?.label ?? s}
              </Text>
            )}
            dropdownClassName="!z-20"
            className="w-full"
          />

          {(filters.status || filters.type) && (
            <Button
              size="sm"
              onClick={onResetFilters}
              variant="flat"
              className="h-9 w-full bg-gray-200/70"
            >
              <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" />
              Effacer les filtres
            </Button>
          )}
        </div>
      </FilterDrawerView>
    </Flex>
  );
}
