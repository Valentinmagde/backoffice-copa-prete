'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Checkbox, Password, Button, Input, Text } from 'rizzui';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import { loginSchema, LoginSchema } from '@/validators/login.schema';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const initialValues: LoginSchema = {
  email: '',
  password: '',
  rememberMe: true,
};

export default function SignInForm() {
  const [reset, setReset] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [status, session, router]);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Adresse mail ou mot de passe incorrect");
        setIsLoading(false);
        return;
      } else {
        // router.push('/');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      toast.error('Erreur lors de la connexion');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              type="email"
              size="lg"
              label="Adresse e-mail"
              placeholder="Entrez votre adresse e-mail"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('email')}
              error={errors.email?.message}
            />
            <Password
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between pb-2">
              <Checkbox
                {...register('rememberMe')}
                label="Se souvenir de moi"
                className="[&>label>span]:font-medium"
              />
              <Link
                href={routes.auth.forgotPassword}
                className="h-auto p-0 text-sm font-semibold text-blue underline transition-colors hover:text-gray-900 hover:no-underline"
              >
                Mot de passe oublié?
              </Link>
            </div>
            <Button className="w-full" type="submit" size="lg" isLoading={isLoading}>
              <span>Se connecter</span>{' '}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>
    </>
  );
}
