'use client';

import { Switch, Text } from 'rizzui';
import { useUpdateDocumentCorrectionSettings } from '@/lib/api/hooks/use-mpme';
import toast from 'react-hot-toast';

type Field = 'documentCorrectionAllowed' | 'documentsCorrected' | 'hasSubmitDocumentsCorrected';

const FIELDS: { key: Field; label: string; description: string }[] = [
    {
        key: 'documentCorrectionAllowed',
        label: 'Correction autorisée',
        description: 'Permet au candidat de soumettre des documents corrigés.',
    },
    {
        key: 'documentsCorrected',
        label: 'Documents corrigés (en attente)',
        description: 'Le candidat a soumis des corrections en attente de décision.',
    },
    {
        key: 'hasSubmitDocumentsCorrected',
        label: 'A déjà soumis des corrections',
        description: 'Marqueur historique permanent — ne se remet pas à false.',
    },
];

export default function DocumentCorrectionSettings({
    beneficiaryId,
    documentCorrectionAllowed,
    documentsCorrected,
    hasSubmitDocumentsCorrected,
}: {
    beneficiaryId: number;
    documentCorrectionAllowed?: boolean;
    documentsCorrected?: boolean;
    hasSubmitDocumentsCorrected?: boolean;
}) {
    const { mutate, isPending } = useUpdateDocumentCorrectionSettings(beneficiaryId);

    const values: Record<Field, boolean> = {
        documentCorrectionAllowed: documentCorrectionAllowed ?? false,
        documentsCorrected: documentsCorrected ?? false,
        hasSubmitDocumentsCorrected: hasSubmitDocumentsCorrected ?? false,
    };

    const handleToggle = (field: Field, value: boolean) => {
        mutate(
            { [field]: value },
            {
                onSuccess: () => toast.success('Mis à jour'),
            },
        );
    };

    return (
        <div className="divide-y divide-gray-100">
            {FIELDS.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between py-4">
                    <div>
                        <Text className="text-sm font-medium text-gray-800">{label}</Text>
                        <Text className="text-xs text-gray-400">{description}</Text>
                    </div>
                    <Switch
                        checked={values[key]}
                        onChange={(e) => handleToggle(key, e.target.checked)}
                        disabled={isPending}
                    />
                </div>
            ))}
        </div>
    );
}
