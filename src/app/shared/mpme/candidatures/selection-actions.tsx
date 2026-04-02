'use client';

import { useState } from 'react';
import { Button, Modal, Text, Textarea, Badge } from 'rizzui';
import {
    PiCheckCircle, PiStar, PiXCircle,
    PiWarning, PiSpinner,
} from 'react-icons/pi';
import {
    usePreselectBeneficiary,
    useSelectBeneficiary,
    useRejectBeneficiary,
} from '@/lib/api/hooks/use-mpme';

type Action = 'preselect' | 'select' | 'reject' | null;

const ACTION_CONFIG = {
    preselect: {
        label: 'Présélectionner',
        icon: PiStar,
        color: 'primary' as const,
        title: 'Confirmer la présélection',
        description: 'Ce candidat sera marqué comme présélectionné.',
        placeholder: 'Commentaire (optionnel)',
        confirmLabel: 'Présélectionner',
        confirmColor: 'primary' as const,
    },
    select: {
        label: 'Sélectionner',
        icon: PiCheckCircle,
        color: 'success' as const,
        title: 'Confirmer la sélection',
        description: 'Ce candidat sera définitivement sélectionné pour le programme.',
        placeholder: 'Commentaire (optionnel)',
        confirmLabel: 'Sélectionner',
        confirmColor: 'success' as const,
    },
    reject: {
        label: 'Rejeter',
        icon: PiXCircle,
        color: 'danger' as const,
        title: 'Confirmer le rejet',
        description: 'Cette action est irréversible. Veuillez indiquer le motif.',
        placeholder: 'Motif du rejet (obligatoire)',
        confirmLabel: 'Rejeter le dossier',
        confirmColor: 'danger' as const,
    },
};

// Transitions autorisées par statut
const ALLOWED_ACTIONS: Record<string, Action[]> = {
    REGISTERED: ['preselect', 'reject'],
    PRESELECTED: ['select', 'reject'],
    VALIDATED: [],
    REJECTED: ['preselect'],  // possibilité de reconsidérer
};

export default function SelectionActions({
    beneficiaryId,
    currentStatus,
    beneficiaryName,
}: {
    beneficiaryId: number;
    currentStatus: string;
    beneficiaryName: string;
}) {
    const [openAction, setOpenAction] = useState<Action>(null);
    const [comment, setComment] = useState('');

    const { mutate: preselect, isPending: preselectLoading } = usePreselectBeneficiary(beneficiaryId);
    const { mutate: select, isPending: selectLoading } = useSelectBeneficiary(beneficiaryId);
    const { mutate: reject, isPending: rejectLoading } = useRejectBeneficiary(beneficiaryId);

    const isLoading = preselectLoading || selectLoading || rejectLoading;
    const allowedActions = ALLOWED_ACTIONS[currentStatus] ?? [];

    if (allowedActions.length === 0) return null;

    const handleConfirm = () => {
        if (openAction === 'reject' && !comment.trim()) return; // motif obligatoire

        const handlers = { preselect, select, reject };
        handlers[openAction!](comment, {
            onSuccess: () => {
                setOpenAction(null);
                setComment('');
            },
        });
    };

    const config = openAction ? ACTION_CONFIG[openAction] : null;

    return (
        <>
            {/* Boutons d'action */}
            <div className="flex flex-wrap items-center gap-2">
                {(allowedActions as Action[]).map((action) => {
                    const cfg = ACTION_CONFIG[action!];
                    const Icon = cfg.icon;
                    return (
                        <Button
                            key={action}
                            color={cfg.color}
                            variant={action === 'reject' ? 'outline' : 'solid'}
                            className="gap-2"
                            onClick={() => { setOpenAction(action); setComment(''); }}
                        >
                            <Icon className="size-4" />
                            {cfg.label}
                        </Button>
                    );
                })}
            </div>

            {/* Modal de confirmation */}
            <Modal isOpen={!!openAction} onClose={() => setOpenAction(null)}>
                <div className="p-6">
                    {/* En-tête */}
                    <div className="mb-5 flex items-start gap-4">
                        <div className={`rounded-full p-2 ${openAction === 'reject' ? 'bg-red-100' :
                                openAction === 'select' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                            {config && <config.icon className={`size-6 ${openAction === 'reject' ? 'text-red-500' :
                                    openAction === 'select' ? 'text-green-500' : 'text-blue-500'
                                }`} />}
                        </div>
                        <div>
                            <Text className="text-base font-semibold text-gray-800">
                                {config?.title}
                            </Text>
                            <Text className="mt-1 text-sm text-gray-500">
                                {config?.description}
                            </Text>
                            <Badge variant="flat" color="default" className="mt-2">
                                {beneficiaryName}
                            </Badge>
                        </div>
                    </div>

                    {/* Avertissement pour rejet */}
                    {openAction === 'reject' && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
                            <PiWarning className="mt-0.5 size-4 shrink-0 text-red-500" />
                            <Text className="text-xs text-red-600">
                                Le motif de rejet sera communiqué au candidat. Soyez précis et constructif.
                            </Text>
                        </div>
                    )}

                    {/* Champ commentaire / motif */}
                    <Textarea
                        label={openAction === 'reject' ? 'Motif du rejet *' : 'Commentaire'}
                        placeholder={config?.placeholder}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="mb-6"
                        error={
                            openAction === 'reject' && !comment.trim()
                                ? 'Le motif est obligatoire'
                                : undefined
                        }
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpenAction(null)}
                            disabled={isLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            color={config?.confirmColor}
                            onClick={handleConfirm}
                            isLoading={isLoading}
                            disabled={openAction === 'reject' && !comment.trim()}
                        >
                            {isLoading
                                ? 'En cours...'
                                : config?.confirmLabel
                            }
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}