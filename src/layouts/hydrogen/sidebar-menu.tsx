'use client';

import Link from 'next/link';
import { Fragment, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Title } from 'rizzui/typography';
import { Collapse } from 'rizzui/collapse';
import cn from '@core/utils/class-names';
import { PiCaretDownBold } from 'react-icons/pi';
import { menuItems, MenuItem } from '@/layouts/hydrogen/menu-items';
import StatusBadge from '@core/components/get-status-badge';
import { Skeleton } from 'rizzui';
import { useAuthRoles } from '@/lib/api/hooks/use-auth-roles';

export function SidebarMenu() {
  const pathname = usePathname();
  const { hasAnyRole, hasAnyPermission, isLoading } = useAuthRoles();
  const pathWithoutId = pathname.replace(/\/\d+/g, '');

  // Filtrer les éléments de menu en fonction des rôles
  const filteredMenuItems = useMemo(() => {
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .map(item => {
          // Vérifier si l'utilisateur a accès à cet élément
          let hasAccess = true;

          if (item.allowedRoles && item.allowedRoles.length > 0) {
            hasAccess = hasAnyRole(...(item.allowedRoles as any));
          }

          if (hasAccess && item.requiredPermissions && item.requiredPermissions.length > 0) {
            hasAccess = hasAnyPermission(...item.requiredPermissions);
          }

          if (!hasAccess) return null;

          // Filtrer les dropdownItems récursivement
          let filteredDropdownItems: MenuItem[] | undefined;
          if (item.dropdownItems) {
            filteredDropdownItems = filterItems(item.dropdownItems);
            if (filteredDropdownItems.length === 0 && item.href === '#') {
              return null;
            }
          }

          return {
            ...item,
            dropdownItems: filteredDropdownItems,
          };
        })
        .filter(Boolean) as MenuItem[];
    };

    return filterItems(menuItems);
  }, [hasAnyRole, hasAnyPermission]);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2 px-3 3xl:mt-6">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 pb-3 3xl:mt-6">
      {filteredMenuItems.map((item, index) => {
        const isActive = pathWithoutId === (item?.href as string);
        const pathnameExistInDropdowns: any = item?.dropdownItems?.filter(
          (dropdownItem) => dropdownItem.href === pathWithoutId
        );
        const isDropdownOpen = Boolean(pathnameExistInDropdowns?.length);

        return (
          <Fragment key={item.name + '-' + index}>
            {item?.href ? (
              <>
                {item?.dropdownItems && item.dropdownItems.length > 0 ? (
                  <Collapse
                    defaultOpen={isDropdownOpen}
                    header={({ open, toggle }) => (
                      <div
                        onClick={toggle}
                        className={cn(
                          'group relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2',
                          isDropdownOpen
                            ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                            : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90 dark:hover:text-gray-700'
                        )}
                      >
                        <span className="flex items-center">
                          {item?.icon && (
                            <span
                              className={cn(
                                'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]',
                                isDropdownOpen
                                  ? 'text-primary'
                                  : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                              )}
                            >
                              {item?.icon}
                            </span>
                          )}
                          {item.name}
                        </span>

                        <PiCaretDownBold
                          strokeWidth={3}
                          className={cn(
                            'h-3.5 w-3.5 -rotate-90 text-gray-500 transition-transform duration-200 rtl:rotate-90',
                            open && 'rotate-0 rtl:rotate-0'
                          )}
                        />
                      </div>
                    )}
                  >
                    {item?.dropdownItems?.map((dropdownItem, idx) => {
                      const isChildActive =
                        pathWithoutId === (dropdownItem?.href as string);

                      return (
                        dropdownItem?.href && (
                          <Link
                            href={dropdownItem?.href}
                            key={dropdownItem?.name + idx}
                            className={cn(
                              'mx-3.5 mb-0.5 flex items-center justify-between rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5',
                              isChildActive
                                ? 'text-primary'
                                : 'text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            <div className="flex items-center truncate">
                              <span
                                className={cn(
                                  'me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200',
                                  isChildActive
                                    ? 'bg-primary ring-[1px] ring-primary'
                                    : 'opacity-40'
                                )}
                              />{' '}
                              <span className="truncate">
                                {dropdownItem?.name}
                              </span>
                            </div>
                            {dropdownItem?.badge?.length ? (
                              <StatusBadge status={dropdownItem?.badge} />
                            ) : null}
                          </Link>
                        )
                      );
                    })}
                  </Collapse>
                ) : (
                  <Link
                    href={item?.href}
                    className={cn(
                      'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
                      isActive
                        ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                        : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
                    )}
                  >
                    <div className="flex items-center truncate">
                      {item?.icon && (
                        <span
                          className={cn(
                            'me-2 inline-flex size-5 items-center justify-center rounded-md [&>svg]:size-5',
                            isActive
                              ? 'text-primary'
                              : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                          )}
                        >
                          {item?.icon}
                        </span>
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item?.badge?.length ? (
                      <StatusBadge status={item?.badge} />
                    ) : null}
                  </Link>
                )}
              </>
            ) : (
              <Title
                as="h6"
                className={cn(
                  'mb-2 truncate px-6 text-xs font-normal uppercase tracking-widest text-gray-500 2xl:px-8',
                  index !== 0 && 'mt-6 3xl:mt-7'
                )}
              >
                {item.name}
              </Title>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}