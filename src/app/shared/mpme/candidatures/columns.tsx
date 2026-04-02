// 'use client';

// import { createColumnHelper } from '@tanstack/react-table';
// import { Text, Tooltip, ActionIcon, Badge } from 'rizzui';
// import Link from 'next/link';
// import { PiEye, PiPencil, PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
// import { routes } from '@/config/routes';
// import { MPMECandidature } from '@/lib/api/types/mpme.types';
// import TableAvatar from '@core/ui/avatar-card';
// import DateCell from '@core/ui/date-cell';
// import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';

// const columnHelper = createColumnHelper<MPMECandidature>();

// const statusConfig = {
//     SUBMITTED: { label: 'Soumise', color: 'warning' },
//     UNDER_REVIEW: { label: 'En cours d\'évaluation', color: 'info' },
//     PRESELECTED: { label: 'Présélectionnée', color: 'primary' },
//     SELECTED: { label: 'Sélectionnée', color: 'success' },
//     REJECTED: { label: 'Rejetée', color: 'danger' },
//     REGISTERED: { label: 'Inscrit', color: 'secondary' },
// };

// const getStatusBadge = (statusCode: string) => {
//     const config = statusConfig[statusCode as keyof typeof statusConfig] || statusConfig.SUBMITTED;
//     return <Badge color={config.color as any}>{config.label}</Badge>;
// };

// export const candidatesColumns = (expanded: boolean = true) => {
//     const columns = [
//         {
//             id: 'applicationCode',
//             header: 'Code',
//             cell: (info: any) => {
//                 const code = info.row.original.applicationCode || `CAN-${info.row.original.id}`;
//                 return (
//                     <Link href={routes.mpme.candidatures.details(info.row.original.id)} className="text-primary-600 hover:underline">
//                         #{code}
//                     </Link>
//                 );
//             },
//         },
//         columnHelper.accessor('representativeName', {
//             id: 'representative',
//             // size: 200,
//             header: 'Représentant',
//             cell: ({ row }) => (
//                 <TableAvatar
//                     name={row.original.representativeName}
//                     description={row.original.email}
//                 />
//             ),
//         }),
//         columnHelper.accessor('companyName', {
//             id: 'companyName',
//             header: 'Entreprise',
//             enableSorting: true,
//             cell: ({ row }) => {
//                 return (
//                     <div>
//                         <Text className="font-medium">{row.original.companyName}</Text>
//                         {/* <Text className="text-sm text-gray-500">{repName || 'Représentant non renseigné'}</Text> */}
//                     </div>
//                 );
//             },
//         }),
//         // columnHelper.accessor('gender', {
//         //     id: 'gender',
//         //     header: 'Entreprise detenue par',
//         //     enableSorting: true,
//         //     cell: ({ row }) => {
//         //         return (
//         //             <div>
//         //                 <Text className="font-medium">{row.original.companyName}</Text>
//         //                 {/* <Text className="text-sm text-gray-500">{repName || 'Représentant non renseigné'}</Text> */}
//         //             </div>
//         //         );
//         //     },
//         // }),
//         columnHelper.accessor('companyType', {
//             id: 'companyType',
//             // size: 250,
//             header: 'Statut de l\'entreprise',
//             enableSorting: true,
//             cell: ({ row }) => (
//                 <div>
//                     <Text className="font-medium text-gray-700">{row.original.companyType}</Text>
//                 </div>
//             ),
//         }),
//         columnHelper.accessor('legalStatus', {
//             id: 'legalStatus',
//             // size: 250,
//             header: 'Statut légal de  l\'entreprise',
//             enableSorting: true,
//             cell: ({ row }) => (
//                 <div>
//                     <Text className="font-medium text-gray-700">{row.original.legalStatus}</Text>
//                 </div>
//             ),
//         }),
//         // {
//         //     id: 'projectTitle',
//         //     header: 'Projet',
//         //     cell: (info: any) => {
//         //         const projectSector = info.row.original.projectSectors?.join(', ') ||
//         //             info.row.original.otherSector ||
//         //             'Non renseigné';
//         //         return (
//         //             <div>
//         //                 <Text className="font-medium">{info.row.original.projectTitle || 'Non renseigné'}</Text>
//         //                 <Text className="text-sm text-gray-500">{projectSector}</Text>
//         //             </div>
//         //         );
//         //     },
//         // },
//         // {
//         //     id: 'requestedAmount',
//         //     header: 'Montant demandé',
//         //     cell: (info: any) => {
//         //         const amount = info.row.original.requestedSubsidyAmount;
//         //         if (!amount) return '-';
//         //         return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(amount);
//         //     },
//         // },
//         columnHelper.accessor('creationDate', {
//             id: 'creationDate',
//             // size: 250,
//             header: 'Date de création de l\'entreprise',
//             enableSorting: true,
//             cell: ({ row }) => <DateCell date={new Date(row.original.creationDate)} />,
//         }),
//         columnHelper.accessor('creationDate', {
//             id: 'sector',
//             header: 'Secteur d\'activité de l\'entreprise',
//             cell: ({ row }) => <Text className="text-sm text-gray-500">{row.original.sector}</Text>,
//         }),
//         columnHelper.display({
//             id: 'action',
//             size: 120,
//             cell: ({
//                 row,
//                 table: {
//                     options: { meta },
//                 },
//             }) => (
//                 <TableRowActionGroup
//                     hasDelete={false}
//                     hasEdit={false}
//                     hasView={true}
//                     editUrl={'#'}
//                     viewUrl={routes.mpme.candidatures.details(row.original.id)}
//                     deletePopoverTitle={`Supprimer l'entreprise`}
//                     deletePopoverDescription={`Êtes-vous sûr de vouloir supprimer l'entreprise ${row.original.companyName} ?`}
//                     onDelete={() => meta?.handleDeleteRow?.(row.original)}
//                 />
//             ),
//         }),
//     ];

//     return expanded ? [expandedRowColumn, ...columns] : columns;
// };

// // Colonne pour l'expansion des lignes
// const expandedRowColumn = columnHelper.display({
//     id: 'expandedHandler',
//     size: 50,
//     cell: ({ row }) => (
//         <>
//             {row.getCanExpand() && (
//                 <ActionIcon
//                     size="sm"
//                     rounded="full"
//                     aria-label="Expand row"
//                     className="ms-2"
//                     variant={row.getIsExpanded() ? 'solid' : 'outline'}
//                     onClick={row.getToggleExpandedHandler()}
//                 >
//                     {row.getIsExpanded() ? (
//                         <PiCaretUpBold className="size-3.5" />
//                     ) : (
//                         <PiCaretDownBold className="size-3.5" />
//                     )}
//                 </ActionIcon>
//             )}
//         </>
//     ),
// });


'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Text, ActionIcon, Badge, Tooltip, Progress } from 'rizzui';
import Link from 'next/link';
import { PiCaretDownBold, PiCaretUpBold, PiCurrencyDollar } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { MPMECandidature } from '@/lib/api/types/mpme.types';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';

const columnHelper = createColumnHelper<MPMECandidature>();

const STATUS_CONFIG: Record<string, { label: string; color: any }> = {
  REGISTERED:   { label: 'Inscrit',            color: 'default'  },
  PRESELECTED:  { label: 'Présélectionné',      color: 'primary'  },
  VALIDATED:    { label: 'Sélectionné',         color: 'success'  },
  REJECTED:     { label: 'Rejeté',             color: 'danger'   },
  UNDER_REVIEW: { label: 'En évaluation',       color: 'warning'  },
};

const COMPANY_TYPE: Record<string, { label: string; color: any }> = {
  formal:   { label: 'Formel',   color: 'success' },
  informal: { label: 'Informel', color: 'warning' },
  project:  { label: 'Projet',   color: 'primary' },
};

function formatAmount(value?: number | string | null) {
  if (!value) return '—';
  return new Intl.NumberFormat('fr-BI', {
    style: 'currency', currency: 'BIF',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export const candidatesColumns = (expanded = true) => {
  const columns = [
    // ── Code ─────────────────────────────────────────────────────
    columnHelper.display({
      id: 'applicationCode',
      size: 100,
      header: 'Code',
      cell: ({ row }) => {
        const code = row.original.applicationCode || `CAN-${row.original.id}`;
        return (
          <Link
            href={routes.mpme.candidatures.details(row.original.id)}
            className="font-mono text-xs font-semibold text-primary-600 hover:underline"
          >
            #{code}
          </Link>
        );
      },
    }),

    // ── Représentant ─────────────────────────────────────────────
    columnHelper.accessor('representativeName', {
      id: 'representative',
      size: 220,
      header: 'Représentant',
      cell: ({ row }) => (
        <TableAvatar
          name={row.original.representativeName || '—'}
          description={row.original.email}
          src={row.original.profilePhotoUrl}
        />
      ),
    }),

    // ── Entreprise ───────────────────────────────────────────────
    columnHelper.accessor('companyName', {
      id: 'companyName',
      size: 200,
      header: 'Entreprise',
      cell: ({ row }) => {
        const { companyType } = row.original;
        const cfg = COMPANY_TYPE[companyType ?? ''];
        return (
          <div className="flex flex-col gap-1">
            <Text className="text-sm font-semibold text-gray-800">
              {row.original.companyName || '—'}
            </Text>
            {cfg && (
              <Badge color={cfg.color} variant="flat" className="w-fit text-xs">
                {cfg.label}
              </Badge>
            )}
          </div>
        );
      },
    }),

    // ── Secteur ──────────────────────────────────────────────────
    columnHelper.accessor('sector', {
      id: 'sector',
      size: 150,
      header: "Secteur d'activité",
      cell: ({ row }) => (
        <Text className="text-sm text-gray-600">
          {row.original.sector || '—'}
        </Text>
      ),
    }),

    // ── Projet ───────────────────────────────────────────────────
    columnHelper.accessor('projectTitle', {
      id: 'projectTitle',
      size: 200,
      header: 'Titre du projet',
      cell: ({ row }) => {
        const title = row.original.projectTitle;
        if (!title) return <Text className="text-gray-400 text-sm">—</Text>;
        return (
          <Tooltip content={title} placement="top">
            <Text className="max-w-[180px] truncate text-sm font-medium text-gray-700">
              {title}
            </Text>
          </Tooltip>
        );
      },
    }),

    // ── Montant demandé ──────────────────────────────────────────
    columnHelper.accessor('requestedAmount', {
      id: 'requestedAmount',
      size: 160,
      header: 'Subvention demandée',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {/* <PiCurrencyDollar className="size-4 text-gray-400 shrink-0" /> */}
          <Text className="text-sm font-semibold text-gray-800">
            {formatAmount(row.original.requestedAmount)}
          </Text>
        </div>
      ),
    }),

    // ── Coût total projet ────────────────────────────────────────
    columnHelper.accessor('totalProjectCost', {
      id: 'totalProjectCost',
      size: 150,
      header: 'Coût total projet',
      cell: ({ row }) => (
        <Text className="text-sm text-gray-600">
          {formatAmount(row.original.totalProjectCost)}
        </Text>
      ),
    }),

    // ── Province ─────────────────────────────────────────────────
    columnHelper.accessor('province', {
      id: 'province',
      size: 130,
      header: 'Province',
      cell: ({ row }) => (
        <Text className="text-sm text-gray-600">{row.original.province || '—'}</Text>
      ),
    }),

    // ── Complétion ───────────────────────────────────────────────
    // columnHelper.accessor('profileCompletion', {
    //   id: 'profileCompletion',
    //   size: 140,
    //   header: 'Complétion',
    //   cell: ({ row }) => {
    //     const pct = Number(row.original.profileCompletion ?? 0);
    //     const color = pct === 100 ? 'text-green-600' : pct >= 67 ? 'text-blue-600' : 'text-orange-500';
    //     return (
    //       <div className="flex items-center gap-2">
    //         <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
    //           <div
    //             className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 67 ? 'bg-blue-500' : 'bg-orange-400'}`}
    //             style={{ width: `${pct}%` }}
    //           />
    //         </div>
    //         <Text className={`text-xs font-semibold ${color}`}>{pct}%</Text>
    //       </div>
    //     );
    //   },
    // }),

    // ── Statut ───────────────────────────────────────────────────
    columnHelper.accessor('status', {
      id: 'status',
      size: 140,
      header: 'Statut',
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status ?? ''] ?? STATUS_CONFIG.REGISTERED;
        return getStatusBadge(cfg.label)
        // (
        //   <Badge color={cfg.color} variant="flat" className="whitespace-nowrap">
        //     {cfg.label}
        //   </Badge>
        // );
      },
    }),

    // ── Date d'inscription ───────────────────────────────────────
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      size: 140,
      header: "Date d'inscription",
      cell: ({ row }) =>
        row.original.createdAt
          ? <DateCell date={new Date(row.original.createdAt)} />
          : <Text className="text-gray-400">—</Text>,
    }),

    // ── Actions ──────────────────────────────────────────────────
    columnHelper.display({
      id: 'action',
      size: 160,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <TableRowActionGroup
            hasDelete={false}
            hasEdit={false}
            hasView={true}
            viewUrl={routes.mpme.candidatures.details(row.original.id)}
          />
        </div>
      ),
    }),
  ];

  return expanded ? [expandedRowColumn, ...columns] : columns;
};

const expandedRowColumn = columnHelper.display({
  id: 'expandedHandler',
  size: 50,
  cell: ({ row }) =>
    row.getCanExpand() ? (
      <ActionIcon
        size="sm"
        rounded="full"
        aria-label="Expand row"
        className="ms-2"
        variant={row.getIsExpanded() ? 'solid' : 'outline'}
        onClick={row.getToggleExpandedHandler()}
      >
        {row.getIsExpanded()
          ? <PiCaretUpBold className="size-3.5" />
          : <PiCaretDownBold className="size-3.5" />
        }
      </ActionIcon>
    ) : null,
});