'use client';

import { useParams } from 'next/navigation';
import { Button } from 'rizzui/button';
import Link from 'next/link';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { Loader } from 'rizzui';
import { useMPMEInscrit } from '@/lib/api/hooks/use-mpme';
import MPMEInscritDetails from '@/app/shared/mpme/inscrits/mpme-inscrit-details';

export default function MPMEInscritDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data, isLoading } = useMPMEInscrit(parseInt(id));

    const pageHeader = {
        title: `MPME Inscrit #${data?.applicationCode || id}`,
        breadcrumb: [
            {
                href: routes.executive.dashboard,
                name: 'Tableau de bord',
            },
            {
                href: routes.mpme.inscrits.list,
                name: 'MPME Inscrits',
            },
            {
                name: `#${data?.representativeName || id}`,
            },
        ],
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader variant="spinner" size="lg" />
            </div>
        );
    }

    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                {/* <Link href={routes.mpme.inscrits.edit(parseInt(id))} className="mt-4 w-full @lg:mt-0 @lg:w-auto">
                    <Button as="span" className="w-full @lg:w-auto">
                        Modifier
                    </Button>
                </Link> */}
            </PageHeader>
            <MPMEInscritDetails data={data} />
        </>
    );
}