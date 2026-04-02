'use client';

import { type Table as ReactTableType } from '@tanstack/react-table';
import { useState } from 'react';
import {
    PiFunnel, PiMagnifyingGlassBold,
    PiTrashDuotone, PiTrash,
} from 'react-icons/pi';
import { Badge, Button, Flex, Input, Text } from 'rizzui';
import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import ToggleColumns from '@core/components/table-utils/toggle-columns';
import StatusField from '@core/components/controlled-table/status-field';
import DateFiled from '@core/components/controlled-table/date-field';
import { getDateRangeStateValues } from '@core/utils/get-formatted-date';
import type { MPMEFilters } from '@/lib/api/types/mpme.types';
import { useProvinces } from '@/lib/api/hooks/use-reference';

interface TableToolbarProps<T extends Record<string, any>> {
    table: ReactTableType<T>;
    // ✅ Callbacks server-side
    filters?: MPMEFilters;
    onFilterChange?: (filters: Partial<MPMEFilters>) => void;
    onResetFilters?: () => void;
}

const statusOptions = [
    { value: 'REGISTERED', label: 'Inscrit' },
    { value: 'VALIDATED', label: 'Validé' },
    { value: 'PRESELECTED', label: 'Présélectionné' },
    { value: 'REJECTED', label: 'Rejeté' },
];

const categoryOptions = [
    { value: 'BURUNDIAN', label: 'Burundais' },
    { value: 'REFUGEE', label: 'Réfugié' },
];

const companyTypeOptions = [
    { value: 'formal', label: 'Formel' },
    { value: 'informal', label: 'Informel' },
];

const provinceOptions = [
    { value: 'formal', label: 'Formel' },
    { value: 'informal', label: 'Informel' },
];

const genderOptions = [
    { value: 'H', label: 'Homme' },
    { value: 'F', label: 'Femme' },
];

const completionOptions = [
    { value: '0', label: '0% — Non démarré' },
    { value: '33', label: '≥ 33% — Étape 1' },
    { value: '67', label: '≥ 67% — Étape 2' },
    { value: '100', label: '100% — Complet' },
];

export default function Filters<TData extends Record<string, any>>({
    table,
    filters = {},
    onFilterChange,
    onResetFilters,
}: TableToolbarProps<TData>) {
    const [openDrawer, setOpenDrawer] = useState(false);
    const isMultipleSelected = table.getSelectedRowModel().rows.length > 1;
    const { meta } = table.options;

    // Nombre de filtres actifs (hors search)
    const activeFilterCount = [
        filters.statusId,
        filters.category,
        filters.companyType,
        filters.gender,
        filters.minCompletion,
        filters.fromDate,
        filters.toDate,
        filters.provinceId,
    ].filter(Boolean).length;

    return (
        <Flex align="center" justify="between" className="mb-4 gap-3 flex-wrap">
            {/* Recherche — server-side avec debounce */}
            <Input
                type="search"
                placeholder="Rechercher par nom, email..."
                value={filters.search ?? ''}
                onClear={() => onFilterChange?.({ search: '' })}
                onChange={(e) => onFilterChange?.({ search: e.target.value })}
                inputClassName="h-9"
                clearable={true}
                prefix={<PiMagnifyingGlassBold className="size-4" />}
                className="w-full max-w-sm"
            />

            <Flex align="center" gap="3" className="w-auto">
                {isMultipleSelected && (
                    <Button
                        color="danger"
                        variant="outline"
                        className="h-[34px] gap-2 text-sm"
                        onClick={() =>
                            meta?.handleMultipleDelete?.(
                                table.getSelectedRowModel().rows.map((r) => r.original.id)
                            )
                        }
                    >
                        <PiTrash size={18} />
                        Supprimer ({table.getSelectedRowModel().rows.length})
                    </Button>
                )}

                <Button
                    variant="outline"
                    onClick={() => setOpenDrawer(!openDrawer)}
                    className="h-9 pe-3 ps-2.5 relative"
                >
                    <PiFunnel className="me-1.5 size-[18px]" strokeWidth={1.7} />
                    Filtres
                    {/* Badge compteur de filtres actifs */}
                    {activeFilterCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>

                <ToggleColumns table={table} />
            </Flex>

            {/* Drawer filtres avancés */}
            <FilterDrawerView
                isOpen={openDrawer}
                drawerTitle="Filtres avancés"
                setOpenDrawer={setOpenDrawer}
            >
                <div className="grid grid-cols-1 gap-6">
                    <FilterElements
                        filters={filters}
                        onFilterChange={onFilterChange}
                        onResetFilters={onResetFilters}
                    />
                </div>
            </FilterDrawerView>
        </Flex>
    );
}

// ─── Éléments de filtres dans le drawer ───────────────────────────────────────
function FilterElements({
    filters = {},
    onFilterChange,
    onResetFilters,
}: {
    filters?: MPMEFilters;
    onFilterChange?: (f: Partial<MPMEFilters>) => void;
    onResetFilters?: () => void;
}) {
    const { data: provinces = [] } = useProvinces();

    // Transformer en options pour StatusField
    const provinceOptions = provinces.map((p) => ({
        value: String(p.id),
        label: p.name,
    }));


    console.log('provinceOptions', provinceOptions);

    const hasActiveFilters = [
        filters.statusId,
        filters.category,
        filters.companyType,
        filters.gender,
        filters.minCompletion,
        filters.fromDate,
        filters.toDate,
        filters.provinceId,
    ].some(Boolean);

    return (
        <>
            {/* Période d'inscription */}
            <DateFiled
                selectsRange
                dateFormat="dd-MMM-yyyy"
                className="w-full"
                placeholderText="Sélectionner une période"
                selected={getDateRangeStateValues(filters.fromDate ?? null)}
                startDate={getDateRangeStateValues(filters.fromDate ?? null)!}
                endDate={getDateRangeStateValues(filters.toDate ?? null)!}
                onChange={([start, end]: [Date | null, Date | null]) => {
                    onFilterChange?.({
                        fromDate: start ? start.toISOString() : undefined,
                        toDate: end ? end.toISOString() : undefined,
                    });
                }}
                inputProps={{ label: "Période d'inscription" }}
            />

            {/* Statut */}
            {/* <StatusField
                label="Statut"
                options={statusOptions}
                value={filters.statusId ?? []}
                onChange={(val) => onFilterChange?.({ statusId: val })}
                getOptionValue={(opt: { value: any }) => opt.value}
                getOptionDisplayValue={(opt: { value: string }) =>
                    renderStatusBadge(opt.value)
                }
                displayValue={(selected: string) => renderStatusBadge(selected)}
                dropdownClassName="!z-20 h-auto"
                className="w-full"
            /> */}

            {/* Catégorie */}
            <StatusField
                label="Statut"
                options={categoryOptions}
                value={filters.category ?? []}
                onChange={(val) => onFilterChange?.({ category: val })}
                getOptionValue={(opt: { value: any }) => opt.value}
                getOptionDisplayValue={(opt: { value: string }) => (
                    <Text className="font-medium">{opt.value === 'REFUGEE' ? 'Réfugié' : 'Burundais'}</Text>
                )}
                displayValue={(selected: string) => (
                    <Text className="font-medium">{selected === 'REFUGEE' ? 'Réfugié' : 'Burundais'}</Text>
                )}
                dropdownClassName="!z-20"
                className="w-full"
            />

            {/* Province ✅ */}
            <StatusField
                label="Province"
                options={provinceOptions}
                value={filters.provinceId ? String(filters.provinceId) : []}
                onChange={(val) => onFilterChange?.({ provinceId: val ? Number(val) : undefined })}
                getOptionValue={(opt: { value: any }) => opt.value}
                getOptionDisplayValue={(opt: { label: string }) => (
                    <Text className="font-medium">{opt.label}</Text>
                )}
                displayValue={(selected: string) => {
                    const province = provinces.find((p) => String(p.id) === selected);
                    return <Text className="font-medium">{province?.name ?? selected}</Text>;
                }}
                dropdownClassName="!z-20"
                className="w-full"
            />

            {/* Type d'entreprise */}
            <StatusField
                label="Genre"
                options={genderOptions}
                value={filters.gender ?? []}
                onChange={(val) => onFilterChange?.({ gender: val })}
                getOptionValue={(opt: { value: any }) => opt.value}
                getOptionDisplayValue={(opt: { value: string; label: string }) => (
                    <Text className="font-medium capitalize">{opt.label}</Text>
                )}
                displayValue={(selected: string) => (
                    <Text className="font-medium capitalize">{selected}</Text>
                )}
                dropdownClassName="!z-20"
                className="w-full"
            />

            {/* Complétion minimale */}
            <StatusField
                label="Complétion du profil"
                options={completionOptions}
                value={filters.minCompletion ?? []}
                onChange={(val) => onFilterChange?.({ minCompletion: val })}
                getOptionValue={(opt: { value: any }) => opt.value}
                getOptionDisplayValue={(opt: { value: string; label: string }) => (
                    <Text className="font-medium">{opt.label}</Text>
                )}
                displayValue={(selected: string) => (
                    <Text className="font-medium">≥ {selected}%</Text>
                )}
                dropdownClassName="!z-20"
                className="w-full"
            />

            {/* Bouton reset */}
            {hasActiveFilters && (
                <Button
                    size="sm"
                    onClick={onResetFilters}
                    variant="flat"
                    className="h-9 bg-gray-200/70 w-full"
                >
                    <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" />
                    Effacer tous les filtres
                </Button>
            )}
        </>
    );
}

function renderStatusBadge(value: string) {
    const map: Record<string, { color: any; label: string }> = {
        REGISTERED: { color: 'warning', label: 'Inscrit' },
        VALIDATED: { color: 'success', label: 'Validé' },
        PRESELECTED: { color: 'info', label: 'Présélectionné' },
        REJECTED: { color: 'danger', label: 'Rejeté' },
    };
    const { color, label } = map[value] ?? { color: 'default', label: value };
    return (
        <div className="flex items-center">
            <Badge color={color} renderAsDot />
            <Text className="ms-2 font-medium capitalize">{label}</Text>
        </div>
    );
}