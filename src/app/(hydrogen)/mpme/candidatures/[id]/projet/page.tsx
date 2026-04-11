'use client';

import { use } from 'react';
import { Loader, Text, Badge } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import { useMPMECandidature } from '@/lib/api/hooks/use-mpme';
import { PiLightbulb, PiUsers, PiMoney } from 'react-icons/pi';

function InfoRow({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
      <Text className="text-sm font-medium tracking-wider text-gray-400">{label}</Text>
      <Text className="text-sm text-gray-800 text-justify">{value ?? '—'}</Text>
    </div>
  );
}

export default function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: b, isLoading } = useMPMECandidature(Number(id));

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>;

  const p = b?.project;

  const sectorMap = (sector?: string) => {
    switch (sector) {
      case 'agriculture': return 'Agri-business';
      case 'milk': return 'Agro-industrie — Lait';
      case 'poultry': return 'Agro-industrie — Volaille';
      case 'fish': return 'Agro-industrie — Pisciculture';
      case 'tropicalFruit': return 'Agro-industrie — Fruits tropicaux';
      case 'otherAgro': return 'Agro-industrie — Autres secteurs à fort potentiel';
      case 'mining': return 'Industrie minière';
      case 'tourism': return 'Services connexes à l\'agri-business (y compris le tourisme et le numérique)';
      case 'other': return p?.otherSector || '—';
      default: return '—';
    }
  };

  const clientScopeMap = (scope?: string) => {
    switch (scope) {
        case 'local': return 'Local';
        case 'national': return 'National';
        case 'eastAfrica': return 'Afrique de l\'Est';
        case 'international': return 'International';
        default: return '—';
    }
  };
      
  return (
    <div className="@container space-y-8">
      {/* Présentation */}
      <FormGroup title="Présentation du projet" className="@3xl:grid-cols-12">
        <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
          <InfoRow label="Titre du projet"      value={p?.title} />
          <InfoRow label="Objectif du projet"             value={p?.objective} />
          <InfoRow label="Comment avez-vous eu l'idée de cette entreprise ?"      value={p?.businessIdea} />
          <InfoRow label="Activités principales du projet" value={p?.mainActivities} />
          <InfoRow label="Produits ou services proposés"    value={p?.productsServices} />
          <InfoRow label="Profil de la clientèle visée"       value={p?.targetClients} />
          <div className="py-3 border-b border-dashed border-gray-200">
            <Text className="text-sm font-medium tracking-wider text-gray-400 mb-2">Secteur d'activité du projet</Text>
            <div className="flex flex-wrap gap-2">
              {p?.sectors?.length
                ? p.sectors.map((s: string) => (
                    <Badge key={s} variant="flat" color="primary" className="capitalize">{sectorMap(s)}</Badge>
                  ))
                : <Text className="text-sm text-gray-400">—</Text>
              }
            </div>
          </div>
          <div className="py-3 border-b border-dashed border-gray-200">
            <Text className="text-sm font-medium tracking-wider text-gray-400 mb-2">Où comptez-vous vendre vos produits et/ou services ?</Text>
            <div className="flex flex-wrap gap-2">
              {p?.clientScope?.length
                ? p.clientScope.map((s: string) => (
                    <Badge key={s} variant="flat" color="secondary" className="capitalize">{clientScopeMap(s)}</Badge>
                  ))
                : <Text className="text-sm text-gray-400">—</Text>
              }
            </div>
          </div>
          <InfoRow label="Avez-vous des concurrents dans votre secteur d'activité ?"
            value={<Badge color={p?.competition?.hasCompetitors ? 'warning' : 'success'} variant="flat">{p?.competition?.hasCompetitors ? 'Oui' : 'Non'}</Badge>}
          />
          {p?.competition?.hasCompetitors && <InfoRow label="Noms des concurrents" value={p?.competition?.competitorNames} />}
        </div>
      </FormGroup>

      {/* Emplois prévus */}
      <FormGroup title="Emplois prévus dans le cadre du projet" description="Employés planifiés après financement" className="@3xl:grid-cols-12">
        <div className="grid grid-cols-2 gap-4 @3xl:col-span-8 sm:grid-cols-3">
          {[
            { label: 'Nombre de femmes',      value: p?.plannedEmployees?.female, icon: PiUsers },
            { label: 'Nombre d\'hommes',      value: p?.plannedEmployees?.male, icon: PiUsers, color:"text-pink-500" },
            { label: 'Nombre d\'employés permanents',  value: p?.plannedEmployees?.permanent, icon: PiUsers, color:"text-blue-500" },
            { label: 'Nombre de réfugiés',   value: p?.plannedEmployees?.refugee, icon: PiUsers, color:"text-orange-500" },
            { label: 'Nombre de batwa',       value: p?.plannedEmployees?.batwa, icon: PiUsers, color:"text-purple-500" },
            { label: 'Nombre de personnes vivant avec un Handicape',  value: p?.plannedEmployees?.disabled, icon: PiUsers },
            { label: 'Nombre d\'albinos',     value: p?.plannedEmployees?.albinos, icon: PiUsers, color:"text-yellow-500" },
            { label: 'Nombre de rapatriés',  value: p?.plannedEmployees?.repatriates, icon: PiUsers, color:"text-teal-500" },
            { label: 'Nombre d\'employés à temps partiel', value: p?.plannedEmployees?.partTime, icon: PiUsers, color:"text-gray-500" },
          ].map(({ label, value, icon: Icon, color = 'text-primary-500'}) => (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-muted bg-white p-4">
                <div className={`rounded-lg bg-gray-100 p-2 ${color}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <Text className="text-2xl font-bold text-primary-600">{value ?? 0}</Text>
                    <Text className="text-xs text-gray-500">{label}</Text>
                </div>
            </div>
          ))}
        </div>
      </FormGroup>

      {/* Innovation & Impact */}
      <FormGroup title="Autres informations sur votre projet" className="@3xl:grid-cols-12">
        <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
          <InfoRow label="Votre idée d’entreprise est-elle nouvelle ?"
            value={<Badge color={p?.innovation?.isNewIdea ? 'success' : 'default'} variant="flat">{p?.innovation?.isNewIdea ? 'Oui' : 'Non'}</Badge>}
          />
          {p?.innovation?.isNewIdea && (<InfoRow label="Cette nouvelle idée d’entreprise a-t-elle déjà été testée ?"
            value={<Badge color={p?.innovation?.ideaTested ? 'success' : 'default'} variant="flat">{p?.innovation?.ideaTested ? 'Oui' : 'Non'}</Badge>}
          />)}
          <InfoRow label="Quelles dispositions avez-vous prises pour remédier au changement climatique ?"  value={p?.impact?.climateActions} />
          <InfoRow label="Seriez-vous disposé(e)s à recruter dans le cadre de votre projet des femmes, des albinos, des Batwa, des personnes handicapées, etc. ?"  value={p?.impact?.inclusionActions} />
          <InfoRow label="Coût total estimé"
            value={p?.financing?.totalCost ? `${Number(p.financing.totalCost).toLocaleString('fr-FR')} BIF` : null}
          />
          <InfoRow label="Subvention demandée"
            value={p?.financing?.requestedSubsidy ? `${Number(p.financing.requestedSubsidy).toLocaleString('fr-FR')} BIF` : null}
          />
          <InfoRow label="Principales dépenses" value={p?.financing?.mainExpenses} />
        </div>
      </FormGroup>
    </div>
  );
}