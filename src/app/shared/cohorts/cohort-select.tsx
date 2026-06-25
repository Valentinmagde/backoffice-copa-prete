'use client';

import { useMemo } from 'react';
import { Select } from 'rizzui';
import { useCohorts } from '@/lib/api/hooks/use-cohorts';

interface CohortSelectProps {
  value?: number;
  onChange: (editionId?: number) => void;
  className?: string;
}

const ALL_EDITIONS = 'all';

export default function CohortSelect({ value, onChange, className }: CohortSelectProps) {
  const { data: cohortsData } = useCohorts();

  const editionOptions = useMemo(() => {
    const editions = cohortsData?.data ?? [];
    return [
      { label: 'Toutes les éditions', value: ALL_EDITIONS },
      ...editions.map((e: any) => ({ label: e.nameFr ?? e.name, value: String(e.id) })),
    ];
  }, [cohortsData]);

  const currentValue = value != null ? String(value) : ALL_EDITIONS;

  return (
    <Select
      options={editionOptions}
      value={currentValue}
      onChange={(v: any) => onChange(v && v !== ALL_EDITIONS ? +v : undefined)}
      getOptionValue={(opt: any) => opt.value}
      displayValue={(selected: any) =>
        editionOptions.find((opt) => opt.value === selected)?.label ?? ''
      }
      className={className ?? 'w-52'}
      selectClassName="h-9 text-sm"
    />
  );
}
