import ProfileSettingsNav from '@/app/shared/account-settings/navigation';

export default function ProfileSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProfileSettingsNav />
      {children}
    </>
  );
}
