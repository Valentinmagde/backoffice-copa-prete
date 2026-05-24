'use client';

import { use } from 'react';
import { Loader, Text, Button, Badge } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import { PiFile, PiDownloadSimple, PiCheckCircle, PiXCircle, PiClock } from 'react-icons/pi';
import { useBusinessPlanDocument } from '@/lib/api/hooks/use-business-plan';

function validationColor(status?: string) {
  switch (status) {
    case 'APPROVED': return 'success' as const;
    case 'REJECTED': return 'danger' as const;
    default:         return 'warning' as const;
  }
}

function validationLabel(status?: string) {
  switch (status) {
    case 'APPROVED': return 'Approuvé';
    case 'REJECTED': return 'Rejeté';
    default:         return 'En attente';
  }
}

function validationIcon(status?: string) {
  switch (status) {
    case 'APPROVED': return <PiCheckCircle className="size-5 text-green-500" />;
    case 'REJECTED': return <PiXCircle className="size-5 text-red-500" />;
    default:         return <PiClock className="size-5 text-orange-400" />;
  }
}

function fmtSize(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function BusinessPlanDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: document, isLoading } = useBusinessPlanDocument(Number(id));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="@container space-y-8">
      <FormGroup
        title="Document du plan"
        description="Fichier PDF soumis par le bénéficiaire"
        className="@3xl:grid-cols-12"
      >
        <div className="@3xl:col-span-8">
          {!document ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <PiFile className="mb-3 size-12 text-gray-300" />
              <Text className="text-gray-500">Aucun document soumis pour ce plan d'affaires</Text>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-muted bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-50 p-3">
                  <PiFile className="size-6 text-primary-500" />
                </div>
                <div>
                  <Text className="text-sm font-semibold text-gray-800">
                    {document.documentType?.name ?? 'Plan d\'affaires'}
                  </Text>
                  <Text className="text-sm text-gray-500">{document.originalFilename}</Text>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    {fmtSize(document.fileSizeBytes) && <span>{fmtSize(document.fileSizeBytes)}</span>}
                    {document.mimeType && <span>• {document.mimeType}</span>}
                    <span>• Soumis le {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {validationIcon(document.validationStatus)}
                <Badge color={validationColor(document.validationStatus)} variant="flat" className="hidden sm:flex">
                  {validationLabel(document.validationStatus)}
                </Badge>
                {document.filePath && (
                  <Button
                    as="a"
                    href={document.filePath}
                    target="_blank"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <PiDownloadSimple className="size-4" />
                    <span>Voir</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </FormGroup>
    </div>
  );
}
