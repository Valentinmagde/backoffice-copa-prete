'use client';

import Link from 'next/link';
import { Button, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import { useScrollableSlider } from '@core/hooks/use-scrollable-slider';
import { PiCaretLeftBold, PiCaretRightBold, PiArrowLeft } from 'react-icons/pi';
import { usePathname, useRouter } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { useBusinessPlanById } from '@/lib/api/hooks/use-business-plan';
import { useAuthRoles } from '@/lib/api/hooks/use-auth-roles';

export default function BusinessPlanNav({ id }: { id: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: businessPlan } = useBusinessPlanById(Number(id));
  const { isSuperAdmin, isAdmin, isCopaManager } = useAuthRoles();

  const { sliderEl, sliderPrevBtn, sliderNextBtn, scrollToTheRight, scrollToTheLeft } =
    useScrollableSlider();

  const title = businessPlan?.projectTitle ?? `Plan d'affaires #${id}`;

  const pageHeader = {
    title,
    breadcrumb: [
      { href: routes.executive.dashboard, name: 'Tableau de bord' },
      { href: routes.businessPlans.list, name: "Plans d'affaires" },
      { name: title },
    ],
  };

  const canSeeEvaluations = isSuperAdmin || isAdmin || isCopaManager;

  const menuItems = [
    { label: "Plan d'affaires", value: routes.businessPlans.details(id) },
    { label: 'Documents',       value: routes.businessPlans.documents(id) },
    ...(canSeeEvaluations
      ? [{ label: 'Évaluations', value: routes.businessPlans.evaluations(id) }]
      : []),
  ];

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(routes.businessPlans.list)}
          className="gap-2"
        >
          <PiArrowLeft className="size-4" />
          Retour
        </Button>
      </PageHeader>

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
                const isActive = pathname === menu.value;
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
