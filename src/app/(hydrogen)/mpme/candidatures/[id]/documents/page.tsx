'use client';

import { use } from 'react';
import { Loader, Text, Badge, Button } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import { PiFile, PiDownloadSimple, PiCheckCircle, PiXCircle, PiClock } from 'react-icons/pi';
import { useMPMECandidature } from '@/lib/api/hooks/use-mpme';

function getValidationColor(status?: string) {
    switch (status) {
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        case 'PENDING': return 'warning';
        default: return 'default';
    }
}

function getValidationLabel(status?: string) {
    switch (status) {
        case 'APPROVED': return 'Approuvé';
        case 'REJECTED': return 'Rejeté';
        case 'PENDING': return 'En attente';
        default: return 'Non soumis';
    }
}

function getValidationIcon(status?: string) {
    switch (status) {
        case 'APPROVED': return <PiCheckCircle className="size-5 text-green-500" />;
        case 'REJECTED': return <PiXCircle className="size-5 text-red-500" />;
        default: return <PiClock className="size-5 text-orange-500" />;
    }
}

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: b, isLoading } = useMPMECandidature(Number(id));

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>;

    const documents = b?.documents ?? [];

    return (
        <div className="@container space-y-8">
            <FormGroup
                title="Documents soumis"
                description={`${documents.length} document(s) trouvé(s)`}
                className="@3xl:grid-cols-12"
            >
                <div className="@3xl:col-span-8 space-y-3">
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center">
                            <PiFile className="mb-3 size-12 text-gray-300" />
                            <Text className="text-gray-500">Aucun document soumis</Text>
                        </div>
                    ) : (
                        documents.map((doc: any) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between gap-4 rounded-lg border border-muted bg-white p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary-50 p-2">
                                        <PiFile className="size-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <Text className="text-sm font-medium text-gray-800">
                                            {doc.type || doc.key}
                                        </Text>
                                        <Text className="text-xs text-gray-400">
                                            {doc.originalFilename} •{' '}
                                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                                        </Text>
                                        <Text className="text-xs text-gray-400">
                                            Uploadé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                                            {doc.uploadedBy ? ` par ${doc.uploadedBy}` : ''}
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {getValidationIcon(doc.validationStatus)}
                                    <Badge
                                        color={getValidationColor(doc.validationStatus)}
                                        variant="flat"
                                        className="hidden sm:flex"
                                    >
                                        {getValidationLabel(doc.validationStatus)}
                                    </Badge>
                                    {doc.filePath && (
                                        <Button
                                            as="a"
                                            href={doc.filePath}
                                            target="_blank"
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <PiDownloadSimple className="size-4" />
                                            <span className="hidden sm:inline">Voir</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </FormGroup>
        </div>
    );
}