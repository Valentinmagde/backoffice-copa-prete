'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { Input, Button, ActionIcon, Title, Select, Password } from 'rizzui';
import {
  CreateUserInput,
  createUserSchema,
} from '@/validators/create-user.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  permissions,
  roles,
  statuses,
} from '@/app/shared/roles-permissions/utils';
import { useCreateUser } from '@/lib/api/hooks/use-users';
import { useRoles } from '@/lib/api/hooks/use-roles';
import toast from 'react-hot-toast';
export default function CreateUser() {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);

  const { mutate: createUser } = useCreateUser();
  const { data: roles, isLoading: rolesLoading } = useRoles();

  const roleOptions = roles?.map(role => ({
    value: role.code,
    label: role.name,
    original: role,
  })) || [];

  // const onSubmit: SubmitHandler<CreateUserInput> = (data) => {
  //   const formattedData = {
  //     ...data
  //   };
  //   setLoading(true);
  //   setTimeout(() => {
  //     console.log('formattedData', formattedData);
  //     setLoading(false);
  //     setReset({
  //       firstName: '',
  //       lastName: '',
  //       email: '',
  //       role: '',
  //       permissions: '',
  //       status: '',
  //     });
  //     closeModal();
  //   }, 600);
  // };

  const onSubmit: SubmitHandler<any> = (data) => {
    setLoading(true);

    const userData = {
      ...data,
      status: data.status || 'Active',
    };

    createUser(userData, {
      onSuccess: () => {
        toast.success('Utilisateur créé avec succès');
        closeModal();
      },
      onError: (error: any) => {
        toast.error(error.message || 'Erreur lors de la création');
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  return (
    <Form<CreateUserInput>
      resetValues={reset}
      onSubmit={onSubmit}
      validationSchema={createUserSchema}
      className="grid grid-cols-1 gap-6 p-6 @container md:grid-cols-2 [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, control, watch, formState: { errors }, }) => {
        return (
          <>
            <div className="col-span-full flex items-center justify-between">
              <Title as="h4" className="font-semibold">
                Ajouter un utilisateur
              </Title>
              <ActionIcon size="sm" variant="text" onClick={closeModal}>
                <PiXBold className="h-auto w-5" />
              </ActionIcon>
            </div>
            <Input
              label="Prénom"
              placeholder="Entrez le prénom de l'utilisateur"
              {...register('firstName')}
              // className="col-span-full"
              error={errors.firstName?.message}
            />

            <Input
              label="Nom"
              placeholder="Entrez le nom de l'utilisateur"
              {...register('lastName')}
              // className="col-span-full"
              error={errors.lastName?.message}
            />

            <Input
              label="Email"
              placeholder="Entrez l'adresse e-mail de l'utilisateur"
              // className="col-span-full"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Téléphone"
              placeholder="+257 XX XX XX XX"
              {...register('phoneNumber')}
              // className="col-span-full"
              error={errors.phoneNumber?.message}
            />

            <Password
              label="Mot de passe"
              placeholder="••••••••"
              {...register('password', { 
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 8,
                  message: 'Le mot de passe doit contenir au moins 8 caractères',
                },
              })}
              className="col-span-full"
              error={errors.password?.message}
            />

            <Controller
              name="roleCode"
              control={control}
              render={({ field: { name, onChange, value } }) => (
                <Select
                  options={roleOptions}
                  value={value ?? ''}
                  onChange={onChange}
                  name={name}
                  label="Role"
                  // className="col-span-full"
                  error={errors?.roleCode?.message}
                  getOptionValue={(option) => option.value}
                  displayValue={(selected: string) =>
                    roleOptions.find((option) => option.value === selected)?.label ??
                    selected
                  }
                  dropdownClassName="!z-[1]"
                  inPortal={false}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field: { name, onChange, value } }) => (
                <Select
                  options={statuses}
                  value={value ?? ''}
                  onChange={onChange}
                  name={name}
                  label="Status"
                  // className="col-span-full"
                  error={errors?.status?.message}
                  getOptionValue={(option) => option.value}
                  displayValue={(selected: string) =>
                    statuses.find((option) => option.value === selected)
                      ?.label ?? ''
                  }
                  dropdownClassName="!z-[1] h-auto"
                  inPortal={false}
                />
              )}
            />

            {/* <Controller
              name="permissions"
              control={control}
              render={({ field: { name, onChange, value } }) => (
                <Select
                  options={permissions}
                  value={value}
                  onChange={onChange}
                  name={name}
                  label="Permissions"
                  error={errors?.status?.message}
                  getOptionValue={(option) => option.value}
                  displayValue={(selected: string) =>
                    permissions.find((option) => option.value === selected)
                      ?.label ?? ''
                  }
                  dropdownClassName="!z-[1] h-auto"
                  inPortal={false}
                />
              )}
            /> */}

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
                Créer l'utilisateur
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
