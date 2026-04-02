import AuthWrapperFour from '@/app/shared/auth-layout/auth-wrapper-four';
import SignInForm from './sign-in-form';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Sign In 4'),
};

export default function SignInPage() {
  return (
    <AuthWrapperFour
      title={
        <>
         Connexion
        </>
      }
      isSignIn
      isSocialLoginActive={false}
    >
      <SignInForm />
    </AuthWrapperFour>
  );
}
