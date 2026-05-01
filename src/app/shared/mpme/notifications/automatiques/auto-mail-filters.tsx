'use client';

import { Input, Select, Button, Text, Dropdown, Popover } from 'rizzui';
import {
    PiMagnifyingGlass,
    PiXBold,
    PiPaperPlaneRight,
    PiCaretDownBold,
    PiStar,
    PiXCircle,
    PiSpinner,
} from 'react-icons/pi';
import { Candidat } from './columns';

interface AutoMailFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    totalItems: number;
    isLoading?: boolean;
    preselectedCount: number;
    rejectedCount: number;
    onBulkSend: (type: 'PRESELECTION' | 'REJECTION' | 'SELECTION', candidats: Candidat[]) => void;
    preselectedCandidats: Candidat[];
    rejectedCandidats: Candidat[];
    isSendingBatch?: boolean;
}

const STATUS_OPTIONS = [
    { label: 'Tous', value: '' },
    { label: 'Présélectionnés', value: 'PRE_SELECTED' },
    { label: 'Rejetés', value: 'REJECTED' },
    { label: 'Sélectionnés', value: 'SELECTED' },
];

export default function AutoMailFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    totalItems,
    isLoading,
    preselectedCount,
    rejectedCount,
    onBulkSend,
    preselectedCandidats,
    rejectedCandidats,
    isSendingBatch,
}: AutoMailFiltersProps) {
    const hasFilters = search || statusFilter;

    const handleReset = () => {
        onSearchChange('');
        onStatusFilterChange('');
    };

    return (
        <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
                prefix={<PiMagnifyingGlass className="size-4 text-gray-400" />}
                placeholder="Rechercher un candidat..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-72"
            />
            <Select
                placeholder="Statut"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(v: any) => onStatusFilterChange(v)}
                className="w-44"
            />
            {hasFilters && (
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <PiXBold className="size-3" />
                    Réinitialiser
                </Button>
            )}
            <div className="ms-auto flex items-center gap-3">
                {isLoading && <PiSpinner className="size-4 animate-spin text-gray-400" />}
                <Text className="text-sm text-gray-500">
                    {totalItems} candidat{totalItems > 1 ? 's' : ''}
                </Text>

                {/* ✅ Correction : Utiliser un span comme trigger au lieu d'un Button */}
                <Popover placement="bottom-end">
                    <Popover.Trigger>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md border border-muted bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSendingBatch}
                        >
                            <PiPaperPlaneRight className="size-4" />
                            Envoi groupé
                            <PiCaretDownBold className="size-3" />
                        </button>
                    </Popover.Trigger>
                    <Popover.Content className="z-10 min-w-[200px] p-1">
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => onBulkSend('PRESELECTION', preselectedCandidats)}
                                disabled={preselectedCount === 0 || isSendingBatch}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PiStar className="size-4 text-blue-500" />
                                <span>Présélectionnés ({preselectedCount})</span>
                            </button>
                            <button
                                onClick={() => onBulkSend('REJECTION', rejectedCandidats)}
                                disabled={rejectedCount === 0 || isSendingBatch}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PiXCircle className="size-4" />
                                <span>Rejetés ({rejectedCount})</span>
                            </button>
                        </div>
                    </Popover.Content>
                </Popover>
            </div>
        </div>
    );
}