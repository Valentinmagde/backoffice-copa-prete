// app/shared/cohorts/create-cohorte.tsx
'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { Input, Button, ActionIcon, Title, Select, Textarea } from 'rizzui';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateCohort, useUpdateCohort } from '@/lib/api/hooks/use-cohorts';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Schéma de validation
const cohortSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom est trop long'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  code: z.string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(20, 'Le code est trop long'),
  year: z.number()
    .min(2000, 'L\'année doit être supérieure à 2000')
    .max(2100, 'L\'année doit être inférieure à 2100'),
  registrationStartDate: z.string().min(1, 'La date de début des inscriptions est requise'),
  registrationEndDate: z.string().min(1, 'La date de fin des inscriptions est requise'),
  submissionStartDate: z.string().min(1, 'La date de début des soumissions est requise'),
  submissionEndDate: z.string().min(1, 'La date de fin des soumissions est requise'),
  totalBudget: z.number().optional(),
  expectedWinnersCount: z.number().optional(),
  status: z.enum(['active', 'inactive']).default('inactive'),
});

type CohortFormData = z.infer<typeof cohortSchema>;

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

interface CreateCohortProps {
  onClose?: () => void;
  cohort?: any; // Pour la modification
}

export default function CreateCohort() {
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);

  const { mutate: createCohort } = useCreateCohort();
  const { mutate: updateCohort } = useUpdateCohort();
  const { closeModal } = useModal();

  // Valeurs par défaut
  const defaultValues: CohortFormData = {
    name: '',
    description: '',
    code: '',
    year: new Date().getFullYear(),
    registrationStartDate: '',
    registrationEndDate: '',
    submissionStartDate: '',
    submissionEndDate: '',
    totalBudget: undefined,
    expectedWinnersCount: undefined,
    status: 'inactive',
  };

  const onSubmit: SubmitHandler<CohortFormData> = (data) => {
    setLoading(true);

    const cohortData = {
      name: data.name,
      description: data.description,
      code: data.code,
      year: data.year,
      registrationStartDate: data.registrationStartDate,
      registrationEndDate: data.registrationEndDate,
      submissionStartDate: data.submissionStartDate,
      submissionEndDate: data.submissionEndDate,
      totalBudget: data.totalBudget,
      expectedWinnersCount: data.expectedWinnersCount,
      isActive: data.status === 'active',
    };

    const mutation = createCohort;
    const successMessage = 'Cohorte créée avec succès';

    mutation(
      cohortData,
      {
        onSuccess: () => {
          toast.success(successMessage);
          setReset(defaultValues);
          closeModal();
        },
        onError: (error: any) => {
          toast.error(error.message || `Erreur lors de la création`);
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <Form<CohortFormData>
      resetValues={reset}
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-6 p-6 @container md:grid-cols-2 [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <div className="col-span-full flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              Ajouter une cohorte
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          {/* Nom et Code */}
          <Input
            label="Nom de la cohorte"
            placeholder="Ex: COPA 2025"
            {...register('name')}
            className="col-span-full"
            error={errors.name?.message}
          />

          <Input
            label="Code"
            placeholder="Ex: COPA2025"
            {...register('code')}
            className=""
            error={errors.code?.message}
          />

          {/* Année */}
          <Input
            label="Année"
            type="number"
            placeholder="2025"
            {...register('year', { valueAsNumber: true })}
            className=""
            error={errors.year?.message}
          />

          {/* Description */}
          {/* <Textarea
            label="Description"
            placeholder="Description de la cohorte..."
            {...register('description')}
            className="col-span-full"
            error={errors.description?.message}
            rows={3}
          /> */}

          {/* Dates d'inscription */}
          <div className="col-span-full">
            <Title as="h5" className="mb-3 text-sm font-medium text-gray-700">
              Période d'inscription
            </Title>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                {...register('registrationStartDate')}
                error={errors.registrationStartDate?.message}
              />
              <Input
                label="Date de fin"
                type="date"
                {...register('registrationEndDate')}
                error={errors.registrationEndDate?.message}
              />
            </div>
          </div>

          {/* Dates de soumission */}
          <div className="col-span-full">
            <Title as="h5" className="mb-3 text-sm font-medium text-gray-700">
              Période de soumission
            </Title>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                {...register('submissionStartDate')}
                error={errors.submissionStartDate?.message}
              />
              <Input
                label="Date de fin"
                type="date"
                {...register('submissionEndDate')}
                error={errors.submissionEndDate?.message}
              />
            </div>
          </div>

          {/* Budget et nombre de lauréats */}
          {/* <Input
            label="Budget total (BIF)"
            type="number"
            placeholder="0"
            {...register('totalBudget', { valueAsNumber: true })}
            className="col-span-full"
            error={errors.totalBudget?.message}
          /> */}

          {/* <Input
            label="Nombre de lauréats attendus"
            type="number"
            placeholder="0"
            {...register('expectedWinnersCount', { valueAsNumber: true })}
            className="col-span-full"
            error={errors.expectedWinnersCount?.message}
          /> */}

          {/* Statut */}
          {/* <Controller
            name="status"
            control={control}
            render={({ field: { name, onChange, value } }) => (
              <Select
                options={statusOptions}
                value={value}
                onChange={onChange}
                name={name}
                label="Statut"
                className="col-span-full"
                error={errors.status?.message}
                getOptionValue={(option) => option.value}
                displayValue={(selected: string) =>
                  statusOptions.find((option) => option.value === selected)?.label ?? selected
                }
                dropdownClassName="!z-[1]"
                inPortal={false}
              />
            )}
          /> */}

          {/* Boutons */}
          <div className="col-span-full flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full @xl:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full @xl:w-auto"
            >
              Créer la cohorte
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}