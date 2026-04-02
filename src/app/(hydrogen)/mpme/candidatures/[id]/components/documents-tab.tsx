'use client';

import { useState } from 'react';
import { PiFile, PiImage, PiFilePdf, PiDownloadSimple, PiEye } from 'react-icons/pi';
import FormGroup from '@/app/shared/form-group';
import { Text, Badge, Button, ActionIcon, Tooltip } from 'rizzui';
import Link from 'next/link';

interface DocumentsTabProps {
    data: any;
}

export default function DocumentsTab({ data }: DocumentsTabProps) {
    const documents = data.documents || [];
    const documentsByKey = data.documentsByKey || {};

    const getFileIcon = (mimeType: string) => {
        if (mimeType?.startsWith('image/')) return <PiImage className="h-5 w-5" />;
        if (mimeType === 'application/pdf') return <PiFilePdf className="h-5 w-5" />;
        return <PiFile className="h-5 w-5" />;
    };

    const getValidationBadge = (status: string) => {
        switch (status) {
            case 'VALIDATED':
                return <Badge color="success">Validé</Badge>;
            case 'REJECTED':
                return <Badge color="danger">Rejeté</Badge>;
            default:
                return <Badge color="warning">En attente</Badge>;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} o`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    };

    const documentLabels: Record<string, string> = {
        idCard: `Carte d'identité`,
        commerceRegister: 'Registre de commerce',
        bankStatements: 'Relevés bancaires',
        communalAttestation: 'Attestation communale',
        criminalRecord: 'Casier judiciaire',
        managerAct: 'Acte de gérance',
    };

    return (
        <>
            <FormGroup
                title="Documents"
                description="Documents soumis pour la candidature"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-4">
                {Object.keys(documentsByKey).length === 0 && (
                    <div className="py-10 text-center">
                        <Text className="text-gray-500">Aucun document soumis</Text>
                    </div>
                )}

                {Object.entries(documentsByKey).map(([key, doc]: [string, any]) => (
                    <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                {getFileIcon(doc.mimeType)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {documentLabels[key] || key}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {doc.originalFilename} • {formatFileSize(doc.fileSizeBytes)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getValidationBadge(doc.validationStatus)}
                            <Tooltip content="Voir" placement="top">
                                <Link href={doc.filePath} target="_blank" rel="noopener noreferrer">
                                    <ActionIcon size="sm" variant="outline">
                                        <PiEye className="h-4 w-4" />
                                    </ActionIcon>
                                </Link>
                            </Tooltip>
                            <Tooltip content="Télécharger" placement="top">
                                <Link href={doc.filePath} download>
                                    <ActionIcon size="sm" variant="outline">
                                        <PiDownloadSimple className="h-4 w-4" />
                                    </ActionIcon>
                                </Link>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}