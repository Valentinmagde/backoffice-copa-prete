'use client';

import { useState } from 'react';
import { Badge, Button, Flex, Input, Text } from 'rizzui';
import { PiMagnifyingGlassBold, PiCheckCircle } from 'react-icons/pi';
import { useSubventions, useApproveTranche } from '@/lib/api/hooks/use-subventions';
import type { Subvention } from '@/lib/api/types/subvention.types';

const TRANCHE_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'danger' }> = {
  PENDING: { label: 'En attente', color: 'warning' },
  REQUESTED: { label: 'Demandée', color: 'info' },
  RELEASED: { label: 'Libérée', color: 'success' },
};

const fmtBIF = (n: number) => Number(n).toLocaleString('fr-FR') + ' BIF';
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function TrancheActions({ subvention }: { subvention: Subvention }) {
  const approve = useApproveTranche(subvention.id);
  return (
    <div className="mt-2 space-y-1.5">
      {subvention.tranches.map((tranche) => {
        const meta = TRANCHE_STATUS[tranche.status] ?? { label: tranche.status, color: 'info' as const };
        return (
          <div key={tranche.id} className="flex items-center gap-3 text-xs">
            <span className="text-gray-500 w-16">Tranche {tranche.tranche_number ?? tranche.trancheNumber}</span>
            <span className="font-medium text-gray-700 w-24">{fmtBIF(tranche.amount)}</span>
            <Badge color={meta.color} variant="flat" className="text-xs">{meta.label}</Badge>
            {tranche.status === 'REQUESTED' && (
              <Button
                size="sm"
                variant="flat"
                className="h-6 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2"
                onClick={() => approve.mutate(tranche.id)}
                isLoading={approve.isPending}
              >
                <PiCheckCircle className="mr-1 size-3" />Libérer
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SubventionsTable() {
  const { data: subventions = [], isLoading } = useSubventions();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = subventions.filter((s) => {
    if (!search) return true;
    const name = `${s.beneficiary?.user?.firstName} ${s.beneficiary?.user?.lastName}`;
    return [s.agreementNumber, name, s.beneficiary?.user?.email].some(
      (f) => f?.toLowerCase().includes(search.toLowerCase()),
    );
  });

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">Chargement des subventions...</div>;
  }

  return (
    <div>
      <Flex align="center" justify="between" className="mb-4 gap-3 flex-wrap">
        <Input
          type="search"
          placeholder="Rechercher par numéro de convention, bénéficiaire..."
          value={search}
          onClear={() => setSearch('')}
          onChange={(e) => setSearch(e.target.value)}
          inputClassName="h-9"
          clearable
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="flex-1 max-w-lg"
        />
        <Text className="text-sm text-gray-500">{filtered.length} subvention(s)</Text>
      </Flex>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Convention</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Bénéficiaire</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Montant accordé</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Signature</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Tranches</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">Aucune subvention trouvée</td>
              </tr>
            ) : (
              filtered.map((s: Subvention) => {
                const name = s.beneficiary?.user
                  ? `${s.beneficiary.user.firstName} ${s.beneficiary.user.lastName}`
                  : '—';
                const isExpanded = expanded === s.id;
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors align-top">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-medium text-primary">{s.agreementNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{name}</div>
                      <div className="text-xs text-gray-400">{s.beneficiary?.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{fmtBIF(s.awardedAmount)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(s.signatureDate)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : s.id)}
                        className="text-xs text-primary underline"
                      >
                        {isExpanded ? 'Masquer' : `Voir tranches (${s.tranches?.length ?? 0})`}
                      </button>
                      {isExpanded && s.tranches?.length > 0 && <TrancheActions subvention={s} />}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
