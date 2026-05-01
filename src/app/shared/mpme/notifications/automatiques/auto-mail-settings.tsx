'use client';

import { useState } from 'react';
import { Button, Input, Switch, Text, Title, Badge } from 'rizzui';
import {
    PiCheckCircle, PiStar, PiXCircle,
    PiPencil, PiEye, PiFloppyDisk,
    PiWarning, PiX,
} from 'react-icons/pi';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import RichTextEditor from '../rich-text-editor';

interface AutoMailTemplate {
    id: string;
    label: string;
    icon: React.ElementType;
    iconColor: string;
    badgeColor: any;
    subject: string;
    body: string;
    enabled: boolean;
    variables: string[];
    description: string;
}

const toHtml = (text: string) =>
    text.trimStart().startsWith('<')
        ? text
        : text.split('\n').map(l => `<p>${l.trim() || '<br>'}</p>`).join('');

const DEFAULT_TEMPLATES: AutoMailTemplate[] = [
    {
        id: 'preselection',
        label: 'Présélection',
        icon: PiStar,
        iconColor: 'text-blue-500',
        badgeColor: 'primary',
        description: 'Envoyé automatiquement lorsqu\'un candidat est présélectionné.',
        subject: 'Votre candidature a été présélectionnée - COPA',
        body: `Bonjour {{prenom}} {{nom}},

Nous avons le plaisir de vous informer que votre candidature (réf. {{code_candidature}}) a été présélectionnée dans le cadre du programme COPA.

{{commentaire}}

Vous serez contacté prochainement pour la suite du processus de sélection.

Cordialement,
L'équipe COPA`,
        enabled: true,
        variables: ['{{prenom}}', '{{nom}}', '{{code_candidature}}', '{{commentaire}}'],
    },
    {
        id: 'rejet',
        label: 'Rejet',
        icon: PiXCircle,
        iconColor: 'text-red-500',
        badgeColor: 'danger',
        description: 'Envoyé automatiquement lorsqu\'un candidat est rejeté. Le motif est injecté automatiquement.',
        subject: 'Résultat de votre candidature - COPA',
        body: `Bonjour {{prenom}} {{nom}},

Nous avons examiné attentivement votre candidature (réf. {{code_candidature}}) et nous avons le regret de vous informer qu'elle n'a pas été retenue à ce stade.

Motif : {{motif_rejet}}

Nous vous encourageons à postuler lors des prochaines sessions du programme.

Cordialement,
L'équipe COPA`,
        enabled: true,
        variables: ['{{prenom}}', '{{nom}}', '{{code_candidature}}', '{{motif_rejet}}'],
    },
    {
        id: 'selection',
        label: 'Sélection finale',
        icon: PiCheckCircle,
        iconColor: 'text-green-500',
        badgeColor: 'success',
        description: 'Envoyé automatiquement lorsqu\'un candidat est définitivement sélectionné.',
        subject: 'Félicitations ! Vous êtes sélectionné - COPA',
        body: `Bonjour {{prenom}} {{nom}},

Nous avons l'honneur de vous informer que votre candidature (réf. {{code_candidature}}) a été retenue pour le programme COPA.

{{commentaire}}

Notre équipe vous contactera très prochainement pour vous communiquer les prochaines étapes.

Félicitations et bienvenue dans le programme !

Cordialement,
L'équipe COPA`,
        enabled: false,
        variables: ['{{prenom}}', '{{nom}}', '{{code_candidature}}', '{{commentaire}}'],
    },
];

export default function AutoMailSettings() {
    const [templates, setTemplates] = useState<AutoMailTemplate[]>(DEFAULT_TEMPLATES);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (id: string) => {
        setTemplates((prev) =>
            prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t)
        );
    };

    const handleChange = (id: string, field: 'subject' | 'body', value: string) => {
        setTemplates((prev) =>
            prev.map((t) => t.id === id ? { ...t, [field]: value } : t)
        );
    };

    const handleSave = async (id: string) => {
        setIsSaving(true);
        try {
            // await mpmeApi.updateAutoMailTemplate(id, templates.find(t => t.id === id));
            // toast.success('Template sauvegardé');
            setEditingId(null);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="@container">
            <HorizontalFormBlockWrapper
                childrenWrapperClassName="gap-0 @lg:gap-0"
                title="Emails automatiques"
                titleClassName="text-xl font-semibold"
                description="Configurez les emails envoyés automatiquement lors des changements de statut des candidatures."
            />

            {templates.map((template) => {
                const Icon = template.icon;
                const isEditing = editingId === template.id;
                const isPreviewing = previewId === template.id;

                return (
                    <HorizontalFormBlockWrapper
                        key={template.id}
                        title={
                            <div className="flex items-center gap-2">
                                <Icon className={`size-5 ${template.iconColor}`} />
                                <span>Email de {template.label}</span>
                                <Badge
                                    color={template.enabled ? template.badgeColor : 'default'}
                                    variant="flat"
                                    className="text-xs"
                                >
                                    {template.enabled ? 'Activé' : 'Désactivé'}
                                </Badge>
                            </div>
                        }
                        description={template.description}
                        descriptionClassName="max-w-sm"
                        childrenWrapperClassName="@3xl:grid-cols-1"
                    >
                        <div className="col-span-2 flex flex-col gap-4">
                            {/* Toggle + actions */}
                            <div className="flex items-center justify-between">
                                <Switch
                                    label={template.enabled ? 'Envoi automatique activé' : 'Envoi automatique désactivé'}
                                    variant="flat"
                                    checked={template.enabled}
                                    onChange={() => handleToggle(template.id)}
                                    labelClassName="text-sm font-medium text-gray-700"
                                />
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1.5"
                                        onClick={() => setPreviewId(isPreviewing ? null : template.id)}
                                    >
                                        <PiEye className="size-4" />
                                        {isPreviewing ? 'Masquer' : 'Aperçu'}
                                    </Button>
                                    {isEditing ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5"
                                                onClick={() => setEditingId(null)}
                                            >
                                                <PiX className="size-4" />
                                                Annuler
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="gap-1.5"
                                                isLoading={isSaving}
                                                onClick={() => handleSave(template.id)}
                                            >
                                                <PiFloppyDisk className="size-4" />
                                                Sauvegarder
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5"
                                            onClick={() => {
                                                setEditingId(template.id);
                                                setPreviewId(null);
                                            }}
                                        >
                                            <PiPencil className="size-4" />
                                            Modifier
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Variables disponibles */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Text className="text-xs text-gray-400">Variables :</Text>
                                {template.variables.map((v) => (
                                    <code
                                        key={v}
                                        className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                                    >
                                        {v}
                                    </code>
                                ))}
                            </div>

                            {/* Formulaire d'édition */}
                            {isEditing ? (
                                <div className="flex flex-col gap-3 rounded-lg border border-primary-200 bg-primary-50/30 p-4">
                                    <Input
                                        label="Sujet"
                                        value={template.subject}
                                        onChange={(e) => handleChange(template.id, 'subject', e.target.value)}
                                    />
                                    <RichTextEditor
                                        label="Corps du message"
                                        value={toHtml(template.body)}
                                        onChange={(val) => handleChange(template.id, 'body', val)}
                                    />
                                    <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                        <PiWarning className="mt-0.5 size-4 shrink-0 text-yellow-500" />
                                        <Text className="text-xs text-yellow-700">
                                            Les variables entre <code>{'{{'}doubles accolades{'}}'}</code> seront remplacées automatiquement par les données du candidat.
                                        </Text>
                                    </div>
                                </div>
                            ) : (
                                /* Vue lecture seule */
                                <div className="rounded-lg border border-muted bg-gray-50 p-4">
                                    <div className="mb-3 border-b border-gray-200 pb-3">
                                        <Text className="text-xs text-gray-400">Sujet</Text>
                                        <Text className="text-sm font-medium text-gray-700">{template.subject}</Text>
                                    </div>
                                    <div
                                        className="prose prose-xs max-w-none text-xs text-gray-500 line-clamp-4"
                                        dangerouslySetInnerHTML={{ __html: toHtml(template.body) }}
                                    />
                                </div>
                            )}

                            {/* Prévisualisation */}
                            {isPreviewing && !isEditing && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                    <Title as="h6" className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Aperçu email
                                    </Title>
                                    <div className="mb-4 border-b border-gray-100 pb-4">
                                        <Text className="text-xs text-gray-400">De : noreply@copa.bi</Text>
                                        <Text className="text-xs text-gray-400">À : prenom.nom@example.com</Text>
                                        <Text className="mt-2 font-semibold text-gray-800">
                                            {template.subject
                                                .replace('{{prenom}}', 'Jean')
                                                .replace('{{nom}}', 'Dupont')
                                                .replace('{{code_candidature}}', 'CAN-001')}
                                        </Text>
                                    </div>
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{
                                            __html: toHtml(template.body)
                                                .replace(/\{\{prenom\}\}/g, 'Jean')
                                                .replace(/\{\{nom\}\}/g, 'Dupont')
                                                .replace(/\{\{code_candidature\}\}/g, 'CAN-001')
                                                .replace(/\{\{motif_rejet\}\}/g, 'Dossier incomplet — pièces justificatives manquantes.')
                                                .replace(/\{\{commentaire\}\}/g, 'Votre dossier a été jugé complet et satisfaisant.')
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </HorizontalFormBlockWrapper>
                );
            })}
        </div>
    );
}