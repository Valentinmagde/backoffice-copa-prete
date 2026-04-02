'use client';

import { Title, Text, Avatar, Button, Popover } from 'rizzui';
import cn from '@core/utils/class-names';
import { routes } from '@/config/routes';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
}) {
  const { data: session, status } = useSession();

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            'w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10',
            buttonClassName
          )}
        >
          <Avatar
            src={session?.user?.image || '/avatar.webp'}
            name={session?.user?.name || 'Utilisateur'}
            className={cn('!h-9 w-9 sm:!h-10 sm:!w-10', avatarClassName)}
          />
          {!!username && (
            <span className="username hidden text-gray-200 dark:text-gray-700 md:inline-flex">
              Hi, Andry
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

const menuItems = [
  {
    name: 'Mon Profil',
    href: routes.settings.profile,
  },
  {
    name: 'Paramètres du compte',
    href: routes.settings.profileSettings,
  },
  // {
  //   name: 'Journal d\'activité',
  //   href: '#',
  // },
];

function DropdownMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      // Déconnexion avec redirection vers la page de connexion
      await signOut({
        redirect: false
      });

      router.push(routes.auth.signIn);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, rediriger quand même
      router.push(routes.auth.signIn);
    }
  };

  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar src={session?.user?.image || "/avatar.webp"} name={session?.user?.name || 'Utilisateur'} />
        <div className="ms-3">
          <Title as="h6" className="font-semibold">
            {session?.user?.name || 'Utilisateur'}
          </Title>
          <Text className="text-gray-600 truncate max-w-[140px]">{session?.user?.email || ''}</Text>
        </div>
      </div>
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={handleSignOut}
        >
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
