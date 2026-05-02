'use client';

import { useState, useRef } from 'react';
import { Button, Input, MultiSelect, Select, Text } from 'rizzui';
import {
    PiUsers,
    PiWarning,
    PiPaperPlaneRight,
    PiUser,
    PiEnvelope,
    PiDeviceMobile,
    PiChatCircleText,
    PiFileXls,
    PiCheckCircle,
    PiXCircle,
} from 'react-icons/pi';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import RichTextEditor from '../rich-text-editor';
import { useSendEmail } from '@/lib/api/hooks/use-notifications';
import { useMPMECandidatures } from '@/lib/api/hooks/use-mpme';
import { mpmeApi } from '@/lib/api/endpoints/mpme.api';
import toast from 'react-hot-toast';
import { useDashboardStats } from '@/lib/api/hooks/use-dashboard';
import type { NotificationType, NotificationChannel } from '@/lib/api/types/notification.types';

type SendMode = 'group' | 'individual';

// ─── Analyse SMS ──────────────────────────────────────────────────────────────

// Remplacement par code point Unicode pour éviter les problèmes d'encodage fichier
const UCS2_CODE_MAP: Record<number, string> = {
    0x00E2: 'a', 0x00C2: 'A', // â Â
    0x00EA: 'e', 0x00CA: 'E', // ê Ê
    0x00EE: 'i', 0x00CE: 'I', // î Î
    0x00F4: 'o', 0x00D4: 'O', // ô Ô
    0x00FB: 'u', 0x00DB: 'U', // û Û
    0x00EB: 'e', 0x00CB: 'E', // ë Ë
    0x00EF: 'i', 0x00CF: 'I', // ï Ï
    0x00E7: 'c',               // ç
    0x2019: "'", 0x2018: "'",  // ' '
    0x201C: '"', 0x201D: '"',  // " "
    0x00AB: '"', 0x00BB: '"',  // « »
    0x2039: "'", 0x203A: "'",  // ‹ ›
    0x2013: '-', 0x2014: '-',  // – —
    0x2012: '-', 0x2015: '-',  // ‒ ―
    0x00A0: ' ', 0x202F: ' ', 0x2009: ' ', 0x2007: ' ', // espaces spéciaux
    0x2026: '...', 0x2022: '-', // … •
};

const replaceUcs2 = (html: string): string => {
    let out = '';
    for (const char of html) {
        const code = char.codePointAt(0)!;
        out += UCS2_CODE_MAP[code] ?? char;
    }
    return out;
};

const GSM7 = new Set(
    '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#%&\'()*+,-./:;<=>?¡' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà\t'
);
const GSM7_EXT = new Set('^{}\\[~]|€');

const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();

function analyzeSms(text: string) {
    const ucs2Chars: string[] = [];
    let gsmLen = 0;

    for (const char of text) {
        if (!GSM7.has(char) && !GSM7_EXT.has(char)) {
            if (!ucs2Chars.includes(char)) ucs2Chars.push(char);
        } else {
            gsmLen += GSM7_EXT.has(char) ? 2 : 1;
        }
    }

    const isUcs2 = ucs2Chars.length > 0;
    const len = text.length;
    const segments = isUcs2
        ? (len <= 70 ? 1 : Math.ceil(len / 67))
        : (gsmLen <= 160 ? 1 : Math.ceil(gsmLen / 153));
    const charsLeft = isUcs2
        ? (segments === 1 ? 70 - len : segments * 67 - len)
        : (segments === 1 ? 160 - gsmLen : segments * 153 - gsmLen);

    return { isUcs2, ucs2Chars, segments, len, charsLeft };
}

const getTargetOptions = (counts: { all: number; preSelected: number; rejected: number; registered: number }) => [
    { label: 'Tous les candidats', value: 'ALL', count: counts.all },
    { label: 'Candidats présélectionnés', value: 'PRE_SELECTED', count: counts.preSelected },
    { label: 'Candidats rejetés', value: 'REJECTED', count: counts.rejected },
    { label: 'Candidats inscrits', value: 'REGISTERED', count: counts.registered },
];

interface XlsImportResult {
    matched: string[];
    notFound: string[];
    total: number;
}

export default function MailComposer() {
    const [mode, setMode] = useState<SendMode>('group');
    const [channel, setChannel] = useState<NotificationChannel>('EMAIL');
    const [target, setTarget] = useState<any>({ label: 'Tous les candidats', value: 'ALL' });
    const [selectedCandidats, setSelectedCandidats] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(false);
    const [xlsResult, setXlsResult] = useState<XlsImportResult | null>(null);
    const [isParsingXls, setIsParsingXls] = useState(false);
    const [xlsCandidates, setXlsCandidates] = useState<typeof candidates>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: candidatesData, isLoading: isLoadingCandidates } = useMPMECandidatures({
        limit: -1,
        isProfileComplete: true,
    });

    const { data: stats } = useDashboardStats();

    const candidates = candidatesData?.data || [];

    // Pool complet = candidats chargés + ceux importés via XLS qui ne sont pas encore dedans
    const allCandidateOptions = [
        ...candidates,
        ...xlsCandidates.filter(x => !candidates.find(c => c.id === x.id)),
    ];

    const selectedCandidatsData = allCandidateOptions.filter(c =>
        selectedCandidats.includes(c.id.toString())
    );

    const counts = {
        all: stats?.totalCandidatures || 0,
        preSelected: stats?.totalPreselected || 0,
        rejected: stats?.totalRejected || 0,
        registered: stats?.totalRegistered || 0,
    };

    const targetOptions = getTargetOptions(counts);
    const targetOption = targetOptions.find(t => t.value === target || t.value === target.value);
    const recipientCount = mode === 'group' ? (targetOption?.count ?? 0) : selectedCandidats.length;

    const { mutate: sendEmail, isPending } = useSendEmail();

    const handleXlsImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsParsingXls(true);
        setXlsResult(null);
        try {
            const { read, utils } = await import('xlsx');
            const buffer = await file.arrayBuffer();
            const wb = read(buffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];

            const rows: Record<string, any>[] = utils.sheet_to_json(ws);
            if (rows.length === 0) { toast.error('Le fichier est vide'); return; }

            // Trouver la colonne id (id, ID, beneficiary_id, beneficiaryId…)
            const ID_VARIANTS = ['id', 'beneficiary_id', 'beneficiaryid', 'beneficiary id', 'identifiant'];
            const allKeys = Object.keys(rows[0]);
            const idKey = allKeys.find(k => ID_VARIANTS.includes(k.trim().toLowerCase()));

            if (!idKey) {
                toast.error(`Colonne "id" introuvable. Colonnes détectées : ${allKeys.join(', ')}`);
                return;
            }

            // Extraire les IDs numériques
            const ids = new Set<number>();
            rows.forEach(row => {
                const v = Number(row[idKey]);
                if (!isNaN(v) && v > 0) ids.add(v);
            });

            if (ids.size === 0) { toast.error('Aucun ID valide dans la colonne "' + idKey + '"'); return; }

            // Appel API direct sans filtre isProfileComplete
            const allResult = await mpmeApi.getCandidatures({ limit: 9999 } as any);
            const allByid = new Map(allResult.data.map(c => [c.id, c]));

            const matched: string[] = [];
            const notFound: string[] = [];
            const newCandidates: typeof candidates = [];

            ids.forEach(id => {
                const c = allByid.get(id);
                if (c) {
                    matched.push(id.toString());
                    // Ajouter au pool local si absent
                    if (!candidates.find(x => x.id === id)) newCandidates.push(c);
                } else {
                    notFound.push(String(id));
                }
            });

            if (newCandidates.length > 0) setXlsCandidates(prev => [...prev, ...newCandidates]);
            setSelectedCandidats(prev => Array.from(new Set([...prev, ...matched])));
            setXlsResult({ matched, notFound, total: ids.size });
        } catch (err: any) {
            toast.error('Erreur lors de la lecture : ' + (err?.message ?? 'fichier invalide'));
        } finally {
            setIsParsingXls(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSend = () => {
        if (channel !== 'SMS' && !subject.trim()) {
            toast.error('Veuillez remplir le sujet');
            return;
        }
        if (!message || !message.replace(/<[^>]*>/g, '').trim()) {
            toast.error('Veuillez remplir le message');
            return;
        }

        if (mode === 'individual' && selectedCandidats.length === 0) {
            toast.error('Veuillez sélectionner au moins un candidat');
            return;
        }

        let beneficiaryIds: number[] = [];

        if (mode === 'individual') {
            beneficiaryIds = selectedCandidats.map(id => parseInt(id));
        } else {
            const grouped = target.value === 'ALL' ? candidates : candidates.filter(c => c.status === target.value);
            beneficiaryIds = grouped.map(c => c.id);
            if (beneficiaryIds.length === 0) {
                toast.error('Aucun candidat dans ce groupe');
                return;
            }
        }

        const dto = {
            type: (mode === 'individual' ? 'INDIVIDUAL' : 'BULK') as NotificationType,
            channel,
            beneficiaryIds,
            subject: channel !== 'SMS' ? subject : undefined,
            message,
            useAutoTemplate: false,
        };

        sendEmail(dto, {
            onSuccess: () => {
                setSubject('');
                setMessage('');
                setPreview(false);
                setSelectedCandidats([]);
                toast.success('Email envoyé avec succès');
            },
            onError: (error: any) => {
                toast.error(error?.message || "Erreur lors de l'envoi");
            },
        });
    };

    return (
        <div className="@container">
            {/* Mode d'envoi */}
            <HorizontalFormBlockWrapper
                title="Mode d'envoi"
                description="Choisissez si vous souhaitez envoyer un email groupé ou à des candidats spécifiques."
                descriptionClassName="max-w-sm"
            >
                <div className="col-span-2 flex items-center gap-6">
                    <button
                        onClick={() => setMode('group')}
                        className={`flex items-center gap-3 rounded-xl border p-4 w-full transition-all ${
                            mode === 'group' ? 'border-primary bg-primary-lighter' : 'border-muted hover:border-gray-300'
                        }`}
                    >
                        <PiUsers className={`size-5 ${mode === 'group' ? 'text-primary' : 'text-gray-400'}`} />
                        <div className="text-left">
                            <Text className="text-sm font-semibold text-gray-800">Envoi groupé</Text>
                            <Text className="text-xs text-gray-500">Par statut (présélectionnés, rejetés…)</Text>
                        </div>
                    </button>
                    <button
                        onClick={() => setMode('individual')}
                        className={`flex items-center gap-3 rounded-xl border p-4 w-full transition-all ${
                            mode === 'individual' ? 'border-primary bg-primary-lighter' : 'border-muted hover:border-gray-300'
                        }`}
                    >
                        <PiUser className={`size-5 ${mode === 'individual' ? 'text-primary' : 'text-gray-400'}`} />
                        <div className="text-left">
                            <Text className="text-sm font-semibold text-gray-800">Candidats spécifiques</Text>
                            <Text className="text-xs text-gray-500">Sélectionner un ou plusieurs candidats</Text>
                        </div>
                    </button>
                </div>
            </HorizontalFormBlockWrapper>

            {/* Canal */}
            <HorizontalFormBlockWrapper
                title="Canal d'envoi"
                description="Choisissez si vous souhaitez envoyer par email, SMS ou les deux."
                descriptionClassName="max-w-sm"
            >
                <div className="col-span-2 flex items-center gap-4">
                    {([
                        { value: 'EMAIL', label: 'Email', sub: 'Boîte mail du candidat', Icon: PiEnvelope },
                        { value: 'SMS',   label: 'SMS',   sub: 'Téléphone du candidat',  Icon: PiDeviceMobile },
                        { value: 'BOTH',  label: 'Email + SMS', sub: 'Les deux canaux',  Icon: PiChatCircleText },
                    ] as const).map(({ value, label, sub, Icon }) => (
                        <button
                            key={value}
                            onClick={() => setChannel(value)}
                            className={`flex items-center gap-3 rounded-xl border p-4 w-full transition-all ${
                                channel === value ? 'border-primary bg-primary-lighter' : 'border-muted hover:border-gray-300'
                            }`}
                        >
                            <Icon className={`size-5 ${channel === value ? 'text-primary' : 'text-gray-400'}`} />
                            <div className="text-left">
                                <Text className="text-sm font-semibold text-gray-800">{label}</Text>
                                <Text className="text-xs text-gray-500">{sub}</Text>
                            </div>
                        </button>
                    ))}
                </div>
            </HorizontalFormBlockWrapper>

            {/* Destinataires */}
            <HorizontalFormBlockWrapper
                title="Destinataires"
                description={
                    mode === 'group'
                        ? 'Sélectionnez le groupe de candidats à notifier.'
                        : 'Recherchez et sélectionnez un ou plusieurs candidats.'
                }
                descriptionClassName="max-w-sm"
            >
                <div className="col-span-2 flex flex-col gap-3">
                    {mode === 'group' ? (
                        <>
                            <Select
                                label="Groupe cible"
                                options={targetOptions.map(t => ({
                                    label: `${t.label} (${t.count})`,
                                    value: t.value,
                                }))}
                                value={target}
                                onChange={(v: any) => setTarget(v)}
                            />
                            <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-muted p-3">
                                <PiUsers className="size-4 text-gray-400" />
                                <Text className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">{recipientCount}</span>{' '}
                                    candidat{recipientCount > 1 ? 's' : ''} concerné{recipientCount > 1 ? 's' : ''}
                                </Text>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Import XLS */}
                            <div className="flex items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xls,.xlsx"
                                    className="hidden"
                                    onChange={handleXlsImport}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    isLoading={isParsingXls}
                                    disabled={isLoadingCandidates || isParsingXls}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <PiFileXls className="size-4 text-green-600" />
                                    Importer un fichier XLS
                                </Button>
                                {xlsResult && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1 text-green-700">
                                            <PiCheckCircle className="size-3.5" />
                                            {xlsResult.matched.length} trouvé{xlsResult.matched.length > 1 ? 's' : ''}
                                        </span>
                                        {xlsResult.notFound.length > 0 && (
                                            <span className="flex items-center gap-1 text-red-500">
                                                <PiXCircle className="size-3.5" />
                                                {xlsResult.notFound.length} non trouvé{xlsResult.notFound.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="text-gray-400 underline hover:text-gray-600"
                                            onClick={() => setXlsResult(null)}
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                )}
                            </div>

                            <MultiSelect
                                label="Candidat(s)"
                                placeholder={isLoadingCandidates ? 'Chargement…' : 'Sélectionnez un ou plusieurs candidats…'}
                                options={allCandidateOptions.map(c => ({
                                    label: `${c.representativeName || 'N/A'} — ${c.applicationCode || 'N/A'} (${c.email || 'N/A'})`,
                                    value: c.id.toString(),
                                }))}
                                value={selectedCandidats}
                                onChange={setSelectedCandidats}
                                disabled={isLoadingCandidates}
                                searchable
                                clearable
                                onClear={() => setSelectedCandidats([])}
                            />
                            {selectedCandidatsData.length > 0 && (
                                <div className="flex flex-col gap-1 rounded-lg border border-muted bg-gray-50 p-3">
                                    <Text className="text-xs text-gray-500 mb-1">
                                        {selectedCandidatsData.length} destinataire{selectedCandidatsData.length > 1 ? 's' : ''} sélectionné{selectedCandidatsData.length > 1 ? 's' : ''}
                                    </Text>
                                    {selectedCandidatsData.map(c => (
                                        <Text key={c.id} className="text-sm text-gray-700">
                                            <span className="font-medium">{c.representativeName}</span>{' '}
                                            <span className="text-gray-400 text-xs">— {c.email}</span>
                                        </Text>
                                    ))}
                                </div>
                            )}
                            {!isLoadingCandidates && candidates.length === 0 && (
                                <Text className="text-sm text-gray-500 text-center py-4">
                                    Aucun candidat trouvé
                                </Text>
                            )}
                        </>
                    )}
                </div>
            </HorizontalFormBlockWrapper>

            {/* Contenu de l'email */}
            <HorizontalFormBlockWrapper
                title="Contenu de l'email"
                description="Rédigez le sujet et le corps de votre message."
                descriptionClassName="max-w-sm"
            >
                <div className="col-span-2 flex flex-col gap-4">
                    {channel !== 'SMS' && (
                        <Input
                            label="Sujet *"
                            placeholder="Objet de l'email"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        />
                    )}
                    <RichTextEditor
                        label="Message *"
                        value={message}
                        onChange={setMessage}
                        placeholder="Rédigez votre message…"
                    />
                    <div className="flex flex-wrap gap-2">
                        <Text className="text-xs text-gray-400">Variables disponibles :</Text>
                        {['{{prenom}}', '{{nom}}', '{{code_candidature}}', '{{entreprise}}'].map(v => (
                            <button
                                key={v}
                                type="button"
                                className="rounded bg-gray-100 px-1 text-xs text-gray-600 hover:bg-gray-200"
                                onClick={() => setMessage(prev => {
                                    if (!prev || prev === '<p><br></p>') return `<p>${v}</p>`;
                                    if (prev.endsWith('</p>')) return prev.slice(0, -4) + v + '</p>';
                                    return prev + v;
                                })}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* ── Analyse SMS ────────────────────────────────────── */}
                    {(channel === 'SMS' || channel === 'BOTH') && (() => {
                        const plain = stripHtml(message);
                        if (!plain) return null;
                        const { isUcs2, ucs2Chars, segments, len, charsLeft } = analyzeSms(plain);
                        return (
                            <div className={`rounded-lg border p-3 text-xs ${isUcs2 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className={`font-semibold ${isUcs2 ? 'text-orange-700' : 'text-green-700'}`}>
                                        {isUcs2 ? '⚠ Encodage UCS2 (caractères spéciaux)' : '✓ Encodage GSM-7'}
                                    </span>
                                    <span className="font-mono text-gray-600">
                                        {len} car. · <strong>{segments} segment{segments > 1 ? 's' : ''}</strong> · ~${(segments * 0.0825).toFixed(4)}/SMS
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span>{charsLeft} caractère{Math.abs(charsLeft) > 1 ? 's' : ''} restant{Math.abs(charsLeft) > 1 ? 's' : ''} dans ce segment</span>
                                    <span className="text-gray-400">|</span>
                                    <span>{isUcs2 ? '70 / 67 chars/seg' : '160 / 153 chars/seg'}</span>
                                </div>
                                {isUcs2 && (
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <div className="text-orange-600">
                                            Caractères forçant UCS2 :{' '}
                                            {ucs2Chars.map(c => (
                                                <code key={c} className="mx-0.5 rounded bg-orange-100 px-1 font-bold">{c}</code>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMessage(replaceUcs2(message))}
                                            className="shrink-0 rounded-md border border-orange-300 bg-white px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
                                        >
                                            Remplacer tout
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </HorizontalFormBlockWrapper>

            {/* Prévisualisation */}
            {preview && subject && message && (
                <HorizontalFormBlockWrapper
                    title="Prévisualisation"
                    description="Aperçu de l'email tel que reçu par le candidat."
                    descriptionClassName="max-w-sm"
                >
                    <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 border-b border-gray-100 pb-4">
                            <Text className="text-xs text-gray-400">De : noreply@copa-prete.bi</Text>
                            <Text className="text-xs text-gray-400">
                                À :{' '}
                                {mode === 'group'
                                    ? targetOption?.label
                                    : selectedCandidats.length === 1
                                    ? selectedCandidatsData[0]?.email ?? '—'
                                    : `${selectedCandidats.length} candidats sélectionnés`}
                            </Text>
                            <Text className="mt-2 font-semibold text-gray-800">{subject}</Text>
                        </div>
                        <div
                            className="prose prose-sm max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ __html: message }}
                        />
                    </div>
                </HorizontalFormBlockWrapper>
            )}

            {/* Avertissement + Actions */}
            <HorizontalFormBlockWrapper title="Envoyer" description="" className="border-0 pb-0">
                <div className="col-span-2 flex flex-col gap-4">
                    <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                        <PiWarning className="mt-0.5 size-4 shrink-0 text-yellow-500" />
                        <Text className="text-xs text-yellow-700">
                            {mode === 'group'
                                ? `Cet email sera envoyé à ${recipientCount} destinataires. Cette action est irréversible.`
                                : selectedCandidats.length > 0
                                ? `Cet email sera envoyé à ${recipientCount} destinataire${recipientCount > 1 ? 's' : ''}. Cette action est irréversible.`
                                : 'Veuillez sélectionner au moins un candidat.'}
                        </Text>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setPreview(!preview)}
                            disabled={!subject || !message || !message.replace(/<[^>]*>/g, '').trim()}
                        >
                            {preview ? 'Masquer aperçu' : 'Prévisualiser'}
                        </Button>
                        <Button
                            className="gap-2"
                            onClick={handleSend}
                            isLoading={isPending}
                            disabled={
                                (channel !== 'SMS' && !subject.trim()) ||
                                !message || !message.replace(/<[^>]*>/g, '').trim() ||
                                (mode === 'individual' && selectedCandidats.length === 0) ||
                                (mode === 'group' && recipientCount === 0)
                            }
                        >
                            <PiPaperPlaneRight className="size-4" />
                            {mode === 'group'
                                ? `Envoyer à ${recipientCount} destinataires`
                                : `Envoyer à ${recipientCount} candidat${recipientCount > 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </div>
            </HorizontalFormBlockWrapper>
        </div>
    );
}
