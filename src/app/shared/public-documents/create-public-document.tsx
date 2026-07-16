'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { Input, Button, ActionIcon, Title, Textarea, Switch } from 'rizzui';
import PdfUpload from '@core/ui/file-upload/pdf-upload';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreatePublicDocument,
  useUpdatePublicDocument,
  useRemovePublicDocumentFile,
} from '@/lib/api/hooks/use-public-documents';
import type { PublicDocument } from '@/lib/api/types/public-documents.types';
import {
  publicDocumentSchema,
  defaultPublicDocumentValues,
  PublicDocumentFormTypes,
} from '@/validators/create-public-document.schema';
import toast from 'react-hot-toast';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NESTJS_API_URL || 'http://localhost:3000/api/v1';

function downloadUrl(id: number, lang: 'fr' | 'rn') {
  return `${API_BASE_URL}/resources/public-documents/${id}/download?lang=${lang}`;
}

interface CreatePublicDocumentProps {
  document?: PublicDocument; // présence => mode édition
}

const toFormValues = (document: PublicDocument): PublicDocumentFormTypes => ({
  titleFr: document.titleFr ?? '',
  titleRn: document.titleRn ?? '',
  descriptionFr: document.descriptionFr ?? '',
  descriptionRn: document.descriptionRn ?? '',
  categoryFr: document.categoryFr ?? '',
  categoryRn: document.categoryRn ?? '',
  isActive: document.isActive,
  displayOrder: document.displayOrder ?? 0,
});

export default function CreatePublicDocument({
  document,
}: CreatePublicDocumentProps) {
  const isEditMode = !!document;
  const [reset] = useState<PublicDocumentFormTypes>(
    isEditMode ? toFormValues(document!) : defaultPublicDocumentValues,
  );
  const [isLoading, setLoading] = useState(false);
  const [fileFr, setFileFr] = useState<File | null>(null);
  const [fileRn, setFileRn] = useState<File | null>(null);

  const { mutate: createDocument } = useCreatePublicDocument();
  const { mutate: updateDocument } = useUpdatePublicDocument();
  const { mutate: removeFile, isPending: isRemovingFile } =
    useRemovePublicDocumentFile();
  const { closeModal } = useModal();

  const hasExistingFr = !!document?.fileKeyFr;
  const hasExistingRn = !!document?.fileKeyRn;

  const onSubmit: SubmitHandler<PublicDocumentFormTypes> = (data) => {
    if (!isEditMode && !fileFr && !fileRn) {
      toast.error('Ajoutez au moins un fichier (FR ou RN)');
      return;
    }

    setLoading(true);

    if (isEditMode) {
      updateDocument(
        { id: document!.id, data, fileFr: fileFr ?? undefined, fileRn: fileRn ?? undefined },
        {
          onSuccess: () => closeModal(),
          onSettled: () => setLoading(false),
        },
      );
      return;
    }

    createDocument(
      { data, fileFr: fileFr ?? undefined, fileRn: fileRn ?? undefined },
      {
        onSuccess: () => closeModal(),
        onSettled: () => setLoading(false),
      },
    );
  };

  return (
    <Form<PublicDocumentFormTypes>
      resetValues={reset}
      validationSchema={publicDocumentSchema}
      onSubmit={onSubmit}
      useFormProps={{ defaultValues: reset }}
      className="grid grid-cols-1 gap-6 p-6 @container md:grid-cols-2 [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <div className="col-span-full flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {isEditMode ? 'Modifier le document' : 'Ajouter un document'}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <Input
            label="Titre (Français)"
            placeholder="Ex: Guide méthodologique de candidature"
            {...register('titleFr')}
            error={errors.titleFr?.message}
          />
          <Input
            label="Titre (Kirundi)"
            placeholder="Ex: Icegeranyo c'uburyo bwo kwiyandikisha"
            {...register('titleRn')}
            error={errors.titleRn?.message}
          />

          <Textarea
            label="Description (Français)"
            {...register('descriptionFr')}
            error={errors.descriptionFr?.message}
            rows={3}
          />
          <Textarea
            label="Description (Kirundi)"
            {...register('descriptionRn')}
            error={errors.descriptionRn?.message}
            rows={3}
          />

          <Input
            label="Catégorie (Français)"
            placeholder="Ex: Guide méthodologique"
            {...register('categoryFr')}
            error={errors.categoryFr?.message}
          />
          <Input
            label="Catégorie (Kirundi)"
            placeholder="Ex: Indongoranyigisho mfatiro"
            {...register('categoryRn')}
            error={errors.categoryRn?.message}
          />
          <Input
            type="number"
            label="Ordre d'affichage"
            placeholder="0"
            {...register('displayOrder')}
            error={errors.displayOrder?.message}
          />

          <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2">
            <PdfUpload
              label="Fichier (Français)"
              file={fileFr}
              existingFilename={hasExistingFr ? document!.originalFilenameFr : undefined}
              existingFileSizeBytes={document?.fileSizeBytesFr}
              existingFileUrl={hasExistingFr ? downloadUrl(document!.id, 'fr') : undefined}
              onChange={setFileFr}
              onRemoveExisting={() =>
                removeFile({ id: document!.id, lang: 'fr' })
              }
              isRemovingExisting={isRemovingFile}
            />
            <PdfUpload
              label="Fichier (Kirundi)"
              file={fileRn}
              existingFilename={hasExistingRn ? document!.originalFilenameRn : undefined}
              existingFileSizeBytes={document?.fileSizeBytesRn}
              existingFileUrl={hasExistingRn ? downloadUrl(document!.id, 'rn') : undefined}
              onChange={setFileRn}
              onRemoveExisting={() =>
                removeFile({ id: document!.id, lang: 'rn' })
              }
              isRemovingExisting={isRemovingFile}
            />
          </div>

          <Controller
            name="isActive"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                label="Actif (visible publiquement)"
                variant="flat"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="col-span-full"
              />
            )}
          />

          <div className="col-span-full flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full @xl:w-auto"
            >
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading} className="w-full @xl:w-auto">
              {isEditMode ? 'Enregistrer' : 'Créer le document'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
