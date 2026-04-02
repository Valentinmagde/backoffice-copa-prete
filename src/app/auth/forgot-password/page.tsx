import AuthWrapperFour from '@/app/shared/auth-layout/auth-wrapper-four';
import ForgetPasswordForm from './forgot-password-form';

export default function ForgotPassword() {
  return (
    <AuthWrapperFour
      title={
        <>
          {/* Vous rencontrez des difficultés pour vous connecter? <br className="hidden sm:inline-block" />{' '} */}
          Réinitialisation de mot de passe
        </>
      }
    >
      <ForgetPasswordForm />
    </AuthWrapperFour>
  );
}
