'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { Button } from 'rizzui';
import { PiTrashSimple, PiDownloadSimple } from 'react-icons/pi';
import {
  useNotifications,
  useResendEmail,
  useDeleteNotification,
  useDeleteMultipleNotifications,
} from '@/lib/api/hooks/use-notifications';
import { notificationColumns, Notification } from './columns';
import NotificationsFilters from './notifications-filters';
import { notificationApi } from '@/lib/api/endpoints/notification.api';
import toast from 'react-hot-toast';

export default function NotificationsHistoriqueTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filters, setFilters] = useState({});
  const [rowSelection, setRowSelection] = useState({}); // ✅ État de sélection

  // API hooks
  const { data, isLoading, refetch } = useNotifications({
    ...filters,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const { mutate: resendEmail } = useResendEmail();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: deleteMultiple } = useDeleteMultipleNotifications();

  const notifications = data?.data || [];
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  // ✅ Obtenir les IDs sélectionnés
  const selectedRowIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
  const selectedCount = selectedRowIds.length;

  // ✅ Configuration du tableau
  const { table, setData } = useTanStackTable<Notification>({
    tableData: notifications,
    columnConfig: notificationColumns(
      (notification) => resendEmail(notification.id),
      (notification) => console.log('View', notification),
      (notification) => deleteNotification(notification.id)
    ),
    options: {
      manualPagination: true,
      pageCount: totalPages,
      state: {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
        rowSelection, // ✅ État de sélection
      },
      enableRowSelection: true, // ✅ Activer la sélection
      enableMultiRowSelection: true, // ✅ Activer la sélection multiple
      onRowSelectionChange: setRowSelection, // ✅ Mettre à jour l'état
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
        },
      },
      enableColumnResizing: false,
      onPaginationChange: (updater) => {
        const current = { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize };
        const next = typeof updater === 'function' ? updater(current) : updater;
        
        if (next.pageIndex !== pagination.pageIndex || next.pageSize !== pagination.pageSize) {
          // ✅ Réinitialiser la sélection quand on change de page
          setRowSelection({});
          setPagination({ pageIndex: next.pageIndex, pageSize: next.pageSize });
        }
      },
    },
  });

  // ✅ Mettre à jour les données quand l'API retourne de nouvelles données
  useEffect(() => {
    setData(notifications);
  }, [notifications]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setRowSelection({}); // ✅ Réinitialiser la sélection quand les filtres changent
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const blob = await notificationApi.exportNotifications(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export terminé');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  // ✅ Suppression groupée avec les IDs sélectionnés
  const handleBulkDelete = () => {
    if (selectedCount === 0) return;
    
    // Récupérer les notifications sélectionnées depuis la table
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map(r => r.original.id);
    
    deleteMultiple(ids, {
      onSuccess: () => {
        setRowSelection({}); // ✅ Réinitialiser la sélection
        refetch(); // ✅ Rafraîchir après suppression
      },
    });
  };

  const getRowClassName = (notification: Notification) => {
    switch (notification.status) {
      case 'FAILED':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'PENDING':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      default:
        return '';
    }
  };

  return (
    <div>
      {/* Barre d'actions */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="outline"
              color="danger"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <PiTrashSimple className="size-4" />
              Supprimer ({selectedCount})
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <PiDownloadSimple className="size-4" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <NotificationsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={() => handleFilterChange({})}
      />

      {/* Tableau */}
      <Table
        table={table}
        variant="modern"
        isLoading={isLoading}
        classNames={{
          container: 'border border-muted rounded-md border-t-0',
          rowClassName: (row: any) => getRowClassName(row.original),
        }}
      />

      {/* Pagination */}
      <TablePagination
        table={table}
        className="py-4"
      />
    </div>
  );
}