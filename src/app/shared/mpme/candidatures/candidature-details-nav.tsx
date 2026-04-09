'use client';

import Link from 'next/link';
import { Button, Text, Badge } from 'rizzui';
import cn from '@core/utils/class-names';
import { useScrollableSlider } from '@core/hooks/use-scrollable-slider';
import { PiCaretLeftBold, PiCaretRightBold, PiArrowLeft } from 'react-icons/pi';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { useMPMECandidature } from '@/lib/api/hooks/use-mpme';
import SelectionActions from './selection-actions';

export default function CandidatureNav({ id }: { id: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: candidature, isLoading } = useMPMECandidature(Number(id));

    const { sliderEl, sliderPrevBtn, sliderNextBtn, scrollToTheRight, scrollToTheLeft } =
        useScrollableSlider();

    const base = `/mpme/candidatures/${id}`;

    const queryString = searchParams.toString();
    const params = queryString ? `?${queryString}` : '';

    const menuItems = [
        { label: 'Informations personnelles', value: `${base}${params}` },
        { label: "Informations sur l'entreprise", value: `${base}/entreprise${params}` },
        { label: 'Présentation du projet', value: `${base}/projet${params}` },
        { label: 'Documents', value: `${base}/documents${params}` },
        { label: 'Statut & Historique', value: `${base}/statut${params}` },
    ];

    const returnUrl = `${routes.mpme.candidatures.list}${params}`;
    const candidaturesListUrl = `${routes.mpme.candidatures.list}${params}`;

    const fullName = candidature
        ? `${candidature?.user?.firstName} ${candidature?.user?.lastName}`
        : `Candidature #${id}`;

    const pageHeader = {
        title: fullName,
        breadcrumb: [
            { href: routes.executive.dashboard, name: 'Tableau de bord' },
            { href: candidaturesListUrl, name: 'Candidatures MPME' },
            { name: fullName },
        ],
    };

    const mapStatus = (status: string) => {
        switch (status) {
            case 'REGISTERED':
                return 'Inscrit';
            case 'PRE_SELECTED':
                return 'Présélectionné';
            case 'SELECTED':
                return 'Sélectionné';
            case 'REJECTED':
                return 'Rejeté';
            default:
                return 'Non soumis';
        }
    };

    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                <div className="flex items-center gap-3">
                    {candidature && (
                        <div className="flex items-center gap-2 rounded-lg border border-muted bg-white px-4 py-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-primary-500 transition-all"
                                    style={{ width: `${candidature?.profileCompletionPercentage}%` }}
                                />
                            </div>
                            <Text className="text-sm font-semibold text-gray-700">
                                {candidature?.profileCompletionPercentage}%
                            </Text>
                        </div>
                    )}

                    {candidature?.status && (
                        <Badge color={candidature?.status?.code === 'REJECTED' ? "danger" : candidature?.status?.code === 'SELECTED' ? "success" : candidature?.status?.code === 'PRE_SELECTED' ? "primary" : "warning"} variant="flat" className="capitalize">
                            {mapStatus(candidature?.status?.code)}
                        </Badge>
                    )}

                    {candidature?.status?.code && (
                        <SelectionActions
                            beneficiaryId={candidature.id}
                            currentStatus={candidature.status.code}
                            beneficiaryName={fullName}
                        />
                    )}

                    {/* ✅ Bouton retour avec préservation des paramètres */}
                    <Button
                        variant="outline"
                        onClick={() => router.push(returnUrl)}
                        className="gap-2"
                    >
                        <PiArrowLeft className="size-4" />
                        Retour
                    </Button>
                </div>
            </PageHeader>

            {/* Navigation tabs */}
            <div className="sticky top-16 z-20 -mx-4 -mt-4 border-b border-muted bg-white px-4 py-0 font-medium text-gray-500 dark:bg-gray-50 md:-mx-5 md:px-5 lg:-mx-8 lg:px-8 2xl:top-20">
                <div className="relative flex items-center overflow-hidden">
                    <Button
                        title="Prev"
                        variant="text"
                        ref={sliderPrevBtn}
                        onClick={() => scrollToTheLeft()}
                        className="!absolute left-0 top-0.5 z-10 !h-[calc(100%-4px)] w-8 !justify-start bg-gradient-to-r from-white via-white to-transparent px-0 text-gray-500 hover:text-black lg:hidden"
                    >
                        <PiCaretLeftBold className="w-5" />
                    </Button>

                    <div className="flex h-[52px] items-start overflow-hidden">
                        <div
                            className="-mb-7 flex w-full gap-3 overflow-x-auto scroll-smooth pb-7 md:gap-5 lg:gap-8"
                            ref={sliderEl}
                        >
                            {menuItems.map((menu, index) => {
                                const isActive = pathname === menu.value.split('?')[0];
                                return (
                                    <Link
                                        href={menu.value}
                                        key={index}
                                        className={cn(
                                            'group relative cursor-pointer whitespace-nowrap py-2.5 font-medium text-gray-500 before:absolute before:bottom-0 before:left-0 before:z-[1] before:h-0.5 before:bg-gray-1000 before:transition-all hover:text-gray-900',
                                            isActive
                                                ? 'before:visible before:w-full before:opacity-100 text-gray-900'
                                                : 'before:invisible before:w-0 before:opacity-0'
                                        )}
                                    >
                                        <Text as="span" className="inline-flex rounded-md px-2.5 py-1.5 transition-all duration-200 group-hover:bg-gray-100/70">
                                            {menu.label}
                                        </Text>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        title="Next"
                        variant="text"
                        ref={sliderNextBtn}
                        onClick={() => scrollToTheRight()}
                        className="!absolute right-0 top-0.5 z-10 !h-[calc(100%-4px)] w-8 !justify-end bg-gradient-to-l from-white via-white to-transparent px-0 text-gray-500 hover:text-black lg:hidden"
                    >
                        <PiCaretRightBold className="w-5" />
                    </Button>
                </div>
            </div>
        </>
    );
}