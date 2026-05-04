'use client';

import { useState } from 'react';
import { Button, Modal, Text, Textarea, Badge, Popover } from 'rizzui';
import {
    PiCheckCircle, PiStar, PiXCircle,
    PiWarning, PiPencil, PiDotsThreeVerticalBold, PiFileText,
} from 'react-icons/pi';
import {
    usePreselectBeneficiary,
    useSelectBeneficiary,
    useRejectBeneficiary,
    useUpdateComment,
} from '@/lib/api/hooks/use-mpme';

type Action = 'preselect' | 'select' | 'reject' | 'edit' | null;

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
    edit: {
        label: 'Modifier le commentaire',
        icon: PiPencil,
        color: 'secondary' as const,
        title: 'Modifier le commentaire',
        description: 'Modifiez le commentaire associé au statut actuel.',
        placeholder: 'Nouveau commentaire',
        confirmLabel: 'Enregistrer',
        confirmColor: 'secondary' as const,
    },
};

const ALLOWED_ACTIONS: Record<string, Action[]> = {
    REGISTERED: ['preselect', 'reject'],
    PRE_SELECTED: ['reject', 'edit'],
    SELECTED: [],
    VALIDATED: [],
    REJECTED: ['preselect', 'edit'],
};

// Quand des documents corrigés ont été soumis après un rejet,
// on propose une réévaluation complète (pas juste modifier le commentaire).
const ALLOWED_ACTIONS_DOCS_CORRECTED: Record<string, Action[]> = {
    ...ALLOWED_ACTIONS,
    REJECTED: ['preselect', 'reject'],
};

export default function SelectionActions({
    beneficiaryId,
    currentStatus,
    beneficiaryName,
    currentComment = '',
    documentsCorrected = false,
    onCommentUpdated,
    useDropdown = false,
}: {
    beneficiaryId: number;
    currentStatus: string;
    beneficiaryName: string;
    currentComment?: string;
    documentsCorrected?: boolean;
    onCommentUpdated?: (comment: string) => void;
    useDropdown?: boolean;
}) {
    const [openAction, setOpenAction] = useState<Action>(null);
    const [comment, setComment] = useState('');
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { mutate: preselect, isPending: preselectLoading } = usePreselectBeneficiary(beneficiaryId);
    const { mutate: select, isPending: selectLoading } = useSelectBeneficiary(beneficiaryId);
    const { mutate: reject, isPending: rejectLoading } = useRejectBeneficiary(beneficiaryId);
    const { mutate: updateComment, isPending: updateLoading } = useUpdateComment(beneficiaryId);

    const isLoading = preselectLoading || selectLoading || rejectLoading || updateLoading;
    const actionMap = documentsCorrected ? ALLOWED_ACTIONS_DOCS_CORRECTED : ALLOWED_ACTIONS;
    const allowedActions = actionMap[currentStatus] ?? [];

    if (allowedActions.length === 0) return null;

    const handleActionClick = (action: Action) => {
        setPopoverOpen(false);
        setOpenAction(action);
        setComment(action === 'edit' ? (currentComment ?? '') : '');
    };

    const handleConfirm = () => {
        if (openAction === 'reject' && !comment.trim()) return;

        if (openAction === 'edit') {
            updateComment(comment, {
                onSuccess: () => {
                    setOpenAction(null);
                    setComment('');
                    onCommentUpdated?.(comment);
                    setTimeout(() => window.location.reload(), 500);
                },
            });
            return;
        }

        const handlers = { preselect, select, reject };
        handlers[openAction!](comment, {
            onSuccess: () => {
                setOpenAction(null);
                setComment('');
                setTimeout(() => window.location.reload(), 500);
            },
        });
    };

    const config = openAction ? ACTION_CONFIG[openAction] : null;

    return (
        <>
            {useDropdown ? (
                /* ── Mode dropdown ── */
                <div className="flex items-center gap-2">
                    <Popover
                        isOpen={popoverOpen}
                        setIsOpen={setPopoverOpen}
                        shadow="sm"
                        placement="bottom-end"
                    >
                        <Popover.Trigger>
                            <Button variant="outline" className="relative gap-2">
                                <PiDotsThreeVerticalBold className="size-4" />
                                Actions
                                {documentsCorrected && (
                                    <span className="absolute -right-1 -top-1 flex size-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex size-3 rounded-full bg-amber-500" />
                                    </span>
                                )}
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content className="z-[9999] p-0 [&>svg]:hidden">
                            <div className="w-56 py-2">
                                {documentsCorrected && (
                                    <div className="mx-3 mb-2 flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 border border-amber-200">
                                        <PiFileText className="size-3.5 shrink-0 text-amber-600" />
                                        <span className="text-xs font-medium text-amber-700">Documents corrigés soumis</span>
                                    </div>
                                )}
                                {(allowedActions as Action[]).map((action) => {
                                    const cfg = ACTION_CONFIG[action!];
                                    const Icon = cfg.icon;
                                    return (
                                        <button
                                            key={action}
                                            onClick={() => handleActionClick(action)}
                                            className="group flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
                                        >
                                            {/* <Icon className="size-4 shrink-0 text-gray-500" /> */}
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                                {/* <div className="mx-4 my-1 border-t border-gray-200" />
                                <button
                                    onClick={() => { setUseDropdown(false); setPopoverOpen(false); }}
                                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-gray-400 hover:bg-gray-100 focus:outline-none"
                                >
                                    Afficher les boutons
                                </button> */}
                            </div>
                        </Popover.Content>
                    </Popover>

                    {/* Revenir aux boutons */}
                    {/* <Button
                        variant="text"
                        className="text-xs text-gray-400 hover:text-gray-600"
                        onClick={() => setUseDropdown(false)}
                    >
                        Afficher boutons
                    </Button> */}
                </div>
            ) : (
                /* ── Mode boutons (défaut) ── */
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
                                onClick={() => handleActionClick(action)}
                            >
                                <Icon className="size-4" />
                                {cfg.label}
                            </Button>
                        );
                    })}

                    {/* Basculer en dropdown */}
                    {/* <Button
                        variant="outline"
                        title="Réduire en menu"
                        onClick={() => setUseDropdown(true)}
                    >
                        <PiDotsThreeVerticalBold className="size-4" />
                    </Button> */}
                </div>
            )}

            {/* ── Modal de confirmation ── */}
            <Modal isOpen={!!openAction} onClose={() => setOpenAction(null)}>
                <div className="p-6">
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

                    {openAction === 'reject' && documentsCorrected && currentComment && (
                        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Motif du rejet précédent
                            </Text>
                            <Text className="text-sm italic text-gray-600">
                                "{currentComment}"
                            </Text>
                        </div>
                    )}

                    {openAction === 'reject' && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
                            <PiWarning className="mt-0.5 size-4 shrink-0 text-red-500" />
                            <Text className="text-xs text-red-600">
                                Le motif de rejet sera communiqué au candidat. Soyez précis et constructif.
                            </Text>
                        </div>
                    )}

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
                            {isLoading ? 'En cours...' : config?.confirmLabel}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}