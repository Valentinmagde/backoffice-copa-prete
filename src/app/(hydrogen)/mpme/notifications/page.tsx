'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { Tab, Loader } from 'rizzui';
import { PiClockBold, PiEnvelopeBold, PiLightningBold } from 'react-icons/pi';
import NotificationsHistoriqueTable from '@/app/shared/mpme/notifications/historique/historique-table';
import MailComposer from '@/app/shared/mpme/notifications/composer/mail-composer';
import { Notification } from '@/app/shared/mpme/notifications/historique/columns';
import AutoMailActions from '@/app/shared/mpme/notifications/automatiques/auto-mail-actions';
import { useAuthRoles } from '@/lib/api/hooks/use-auth-roles';

const pageHeader = {
    title: 'Notifications Email',
    breadcrumb: [
        { href: routes.executive.dashboard, name: 'Tableau de bord' },
        { href: routes.mpme.candidatures.list, name: 'Candidatures MPME' },
        { name: 'Notifications' },
    ],
};

export default function NotificationsPage() {
    const router = useRouter();
    const { hasAnyRole, isLoading } = useAuthRoles();

    useEffect(() => {
        if (!isLoading && !hasAnyRole('SUPER_ADMIN', 'ADMIN')) {
            router.replace(routes.accessDenied);
        }
    }, [isLoading, hasAnyRole, router]);

    if (isLoading || !hasAnyRole('SUPER_ADMIN', 'ADMIN')) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader variant="spinner" size="lg" />
            </div>
        );
    }
    const handleResend = (notification: Notification) => {
        console.log('Renvoyer', notification);
        // Appel API pour renvoyer
    };

    const handleView = (notification: Notification) => {
        console.log('Voir', notification);
        // Ouvrir modal ou rediriger
    };

    const handleDelete = (notification: Notification) => {
        console.log('Supprimer', notification);
        // Appel API pour supprimer
    };

    return (
        <div className="@container">
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
            <Tab>
                <Tab.List>
                    <Tab.ListItem className="flex items-center gap-2">
                        <PiLightningBold className="size-4" />
                        Envoi rapide
                    </Tab.ListItem>
                    <Tab.ListItem className="flex items-center gap-2">
                        <PiEnvelopeBold className="size-4" />
                        Composer
                    </Tab.ListItem>
                    <Tab.ListItem className="flex items-center gap-2">
                        <PiClockBold className="size-4" />
                        Historique
                    </Tab.ListItem>
                    {/* <Tab.ListItem className="flex items-center gap-2">
                        <PiGearBold className="size-4" />
                        Emails automatiques
                    </Tab.ListItem> */}
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel className="mt-6">
                        <AutoMailActions />
                    </Tab.Panel>
                    <Tab.Panel className="mt-6">
                        <MailComposer />
                    </Tab.Panel>
                    <Tab.Panel className="mt-6">
                        <NotificationsHistoriqueTable />
                    </Tab.Panel>
                     {/* <Tab.Panel className="mt-6">
                        <AutoMailSettings />
                    </Tab.Panel> */}
                </Tab.Panels>
            </Tab>
        </div>
    );
}