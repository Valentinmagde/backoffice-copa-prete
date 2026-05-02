'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { Modal, Button, Text } from 'rizzui';
import { PiWarning, PiPaperPlaneRight, PiSpinner } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useMPMECandidatures, usePreselectedBeneficiaries, useRejectedBeneficiaries } from '@/lib/api/hooks/use-mpme';
import { useSendAutoEmail, useSendBatchAutoEmails } from '@/lib/api/hooks/use-notifications';
import AutoMailFilters from './auto-mail-filters';
import { getColumns, Candidat, NOTIF_CONFIG } from './columns';

export default function AutoMailActions() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [confirm, setConfirm] = useState<{ candidat: Candidat; type: 'PRESELECTION' | 'REJECTION' | 'SELECTION' } | null>(null);
    const [bulkConfirm, setBulkConfirm] = useState<{ type: 'PRESELECTION' | 'REJECTION' | 'SELECTION'; candidats: Candidat[] } | null>(null);

    // Récupérer les candidats paginés
    const { data: candidatesData, isLoading, refetch } = useMPMECandidatures({
        search: search || undefined,
        statusCode: statusFilter || undefined,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    // Récupérer TOUS les candidats pour les envois groupés
    const { data: allPreSelected, refetch: refetchPreSelected } = usePreselectedBeneficiaries({
        statusCode: 'PRE_SELECTED',
        limit: -1,
    });
    const { data: allRejected, refetch: refetchRejected } = useRejectedBeneficiaries({
        statusCode: 'REJECTED',
        limit: -1,
    });
    // const { data: allSelected, refetch: refetchSelected } = useMPMECandidatures({
    //     statusCode: 'SELECTED',
    //     limit: -1,
    // });

    const { mutate: sendAutoEmail, isPending: isSendingSingle } = useSendAutoEmail();
    const { mutate: sendBatchAutoEmails, isPending: isSendingBatch } = useSendBatchAutoEmails();

    // ✅ Transformation corrigée pour MPMECandidature
    const transformCandidat = (item: any): Candidat => ({
        id: item.id,
        name: item.representativeName || 'N/A',
        email: item.email || '',
        applicationCode: item.applicationCode || `CAN-${item.id}`,
        status: item.status,
        preSelectedComment: item.preSelectedComment,
        rejectedComment: item.rejectedComment,
        lastNotifiedAt: item.lastNotifiedAt ?? null,
    });

    // const candidats: Candidat[] = candidatesData?.data?.map(transformCandidat) || [];
    const candidats = useMemo(() => {
        return candidatesData?.data?.map(transformCandidat) || [];
    }, [candidatesData]);
    const totalItems = candidatesData?.meta?.total || 0;
    const totalPages = candidatesData?.meta?.totalPages || 0;

    const preselectedCandidats: Candidat[] = (allPreSelected?.data || []).map(transformCandidat);
    const rejectedCandidats: Candidat[] = (allRejected?.data || []).map(transformCandidat);
    // const selectedCandidats: Candidat[] = (allSelected?.data || []).map(transformCandidat);

    const columns = getColumns((candidat, type) => setConfirm({ candidat, type }), isSendingSingle);

    const { table, setData } = useTanStackTable<Candidat>({
        tableData: candidats,
        columnConfig: columns,
        options: {
            enableColumnResizing: false,
            manualPagination: true,
            autoResetPageIndex: false,
            pageCount: totalPages,
            onPaginationChange: (updater: any) => {
                setPagination(prev => typeof updater === 'function' ? updater(prev) : updater);
            },
        },
    });

    // Réinitialiser la page quand les filtres changent
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        table.setPageIndex(0);
    }, [search, statusFilter]);

    const handleSend = () => {
        if (!confirm) return;
        sendAutoEmail({
            beneficiaryId: confirm.candidat.id,
            type: confirm.type,
        }, {
            onSuccess: () => {
                toast.success(`Email envoyé à ${confirm.candidat.name}`);
                setConfirm(null);
                refetch();
                refetchPreSelected();
                refetchRejected();
                // refetchSelected();
            },
            onError: (error: any) => {
                toast.error(error?.message || `Erreur lors de l'envoi à ${confirm.candidat.name}`);
            },
        });
    };

    const handleBulkSend = (type: 'PRESELECTION' | 'REJECTION' | 'SELECTION', candidats: Candidat[]) => {
        if (candidats.length === 0) {
            toast.error('Aucun candidat sélectionné');
            return;
        }
        setBulkConfirm({ type, candidats });
    };

    const confirmBulkSend = () => {
        if (!bulkConfirm) return;
        const beneficiaryIds = bulkConfirm.candidats.map(c => c.id);
        sendBatchAutoEmails({
            type: bulkConfirm.type,
            beneficiaryIds,
        }, {
            onSuccess: (data) => {
                toast.success(`${data?.succeeded || beneficiaryIds.length} email(s) envoyé(s)`);
                setBulkConfirm(null);
                refetch();
                refetchPreSelected();
                refetchRejected();
                // refetchSelected();
            },
            onError: (error: any) => {
                toast.error(error?.message || 'Erreur lors de l\'envoi groupé');
            },
        });
    };

    const cfg = confirm ? NOTIF_CONFIG[confirm.type] : null;
    const bulkCfg = bulkConfirm ? NOTIF_CONFIG[bulkConfirm.type] : null;

    useEffect(() => {
        setData(candidats);
    }, [candidats]);

    return (
        <div>
            <AutoMailFilters
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                totalItems={totalItems}
                isLoading={isLoading}
                preselectedCount={preselectedCandidats.length}
                rejectedCount={rejectedCandidats.length}
                // selectedCount={selectedCandidats.length}
                onBulkSend={handleBulkSend}
                preselectedCandidats={preselectedCandidats}
                rejectedCandidats={rejectedCandidats}
                // selectedCandidats={selectedCandidats}
                isSendingBatch={isSendingBatch}
            />

            <Table
                table={table}
                variant="modern"
                isLoading={isLoading}
                classNames={{
                    container: 'border border-muted rounded-md border-t-0',
                }}
            />
            <TablePagination table={table} className="py-4" />

            {/* Modal individuel */}
            <Modal isOpen={!!confirm} onClose={() => !isSendingSingle && setConfirm(null)}>
                <div className="p-6">
                    <div className="mb-5 flex items-start gap-4">
                        <div className={`rounded-full p-2 ${confirm?.type === 'REJECTION' ? 'bg-red-100' :
                            confirm?.type === 'SELECTION' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                            {cfg && <cfg.icon className={`size-6 ${confirm?.type === 'REJECTION' ? 'text-red-500' :
                                confirm?.type === 'SELECTION' ? 'text-green-500' : 'text-blue-500'
                                }`} />}
                        </div>
                        <div>
                            <Text className="text-base font-semibold text-gray-800">
                                Confirmer l'envoi
                            </Text>
                            <Text className="mt-1 text-sm text-gray-500">
                                L'email sera envoyé à{' '}
                                <span className="font-medium text-gray-700">{confirm?.candidat.name}</span>
                            </Text>
                        </div>
                    </div>

                    {confirm && (
                        <div className="mb-5 rounded-lg border border-muted bg-gray-50 p-4">
                            <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Récapitulatif</Text>
                            <Text className="text-xs text-gray-400">À : {confirm.candidat.email}</Text>
                            <Text className="mt-2 text-xs text-gray-500">
                                Type : <span className="font-medium">{cfg?.label}</span>
                            </Text>
                            {confirm.type === 'REJECTION' && confirm.candidat.rejectedComment && (
                                <Text className="mt-1 text-xs text-gray-500">
                                    Motif : {confirm.candidat.rejectedComment}
                                </Text>
                            )}
                            {confirm.type === 'PRESELECTION' && confirm.candidat.preSelectedComment && (
                                <Text className="mt-1 text-xs text-gray-500">
                                    Commentaire : {confirm.candidat.preSelectedComment}
                                </Text>
                            )}
                        </div>
                    )}

                    <div className="mb-5 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                        <PiWarning className="mt-0.5 size-4 shrink-0 text-yellow-500" />
                        <Text className="text-xs text-yellow-700">
                            Cet email sera envoyé immédiatement avec le template standard.
                        </Text>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setConfirm(null)} disabled={isSendingSingle}>
                            Annuler
                        </Button>
                        <Button color={cfg?.color} className="gap-2" onClick={handleSend} isLoading={isSendingSingle}>
                            <PiPaperPlaneRight className="size-4" />
                            Envoyer
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal groupé */}
            <Modal isOpen={!!bulkConfirm} onClose={() => !isSendingBatch && setBulkConfirm(null)}>
                <div className="p-6">
                    <div className="mb-5 flex items-start gap-4">
                        <div className={`rounded-full p-2 ${bulkConfirm?.type === 'REJECTION' ? 'bg-red-100' :
                            bulkConfirm?.type === 'SELECTION' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                            {bulkCfg && <bulkCfg.icon className={`size-6 ${bulkConfirm?.type === 'REJECTION' ? 'text-red-500' :
                                bulkConfirm?.type === 'SELECTION' ? 'text-green-500' : 'text-blue-500'
                                }`} />}
                        </div>
                        <div>
                            <Text className="text-base font-semibold text-gray-800">
                                Envoi groupé — {bulkCfg?.label}
                            </Text>
                            <Text className="mt-1 text-sm text-gray-500">
                                <span className="font-semibold text-gray-700">{bulkConfirm?.candidats.length}</span>{' '}
                                candidat{(bulkConfirm?.candidats.length ?? 0) > 1 ? 's' : ''}
                            </Text>
                        </div>
                    </div>

                    {/* Liste destinataires */}
                    <div className="mb-5 max-h-48 overflow-y-auto rounded-lg border border-muted">
                        {bulkConfirm?.candidats.map((c) => (
                            <div key={c.id} className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 last:border-0">
                                <div>
                                    <Text className="text-sm font-medium text-gray-700">{c.name}</Text>
                                    <Text className="text-xs text-gray-400">{c.email}</Text>
                                </div>
                                <div className="text-right">
                                    <Text className="font-mono text-xs text-primary-600">#{c.applicationCode}</Text>
                                    {bulkConfirm.type === 'REJECTION' && c.rejectedComment && (
                                        <Text className="max-w-[150px] truncate text-xs italic text-gray-400">
                                            {c.rejectedComment}
                                        </Text>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isSendingBatch && (
                        <div className="mb-5 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <PiWarning className="mt-0.5 size-4 shrink-0 text-yellow-500" />
                            <Text className="text-xs text-yellow-700">
                                Chaque candidat recevra un email personnalisé avec son motif spécifique.
                            </Text>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setBulkConfirm(null)} disabled={isSendingBatch}>
                            Annuler
                        </Button>
                        <Button
                            color={bulkCfg?.color}
                            className="gap-2"
                            onClick={confirmBulkSend}
                            isLoading={isSendingBatch}
                        >
                            <PiPaperPlaneRight className="size-4" />
                            Envoyer à {bulkConfirm?.candidats.length} candidats
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}