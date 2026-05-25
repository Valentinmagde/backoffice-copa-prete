'use client';

import { useMedia } from '@core/hooks/use-media';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import Link from 'next/link';
import { ReactElement, RefObject, useState } from 'react';
import { PiBell, PiCheck } from 'react-icons/pi';
import { Badge, Popover, Text, Title } from 'rizzui';
import { useMyNotifications, useMyUnreadCount, useMarkAsRead } from '@/lib/api/hooks/use-notifications';
import type { UserNotification } from '@/lib/api/types/notification.types';
import { routes } from '@/config/routes';
import { useAuthRoles } from '@/lib/api/hooks/use-auth-roles';

dayjs.extend(relativeTime);
dayjs.locale('fr');

function NotificationItem({ item, onRead }: { item: UserNotification; onRead: (id: number) => void }) {
  return (
    <div
      onClick={() => !item.isRead && onRead(item.id)}
      className={`group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-50 ${!item.isRead ? 'bg-blue-50/60 dark:bg-blue-50/20' : ''}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50">
        <PiBell className="h-5 w-5 text-gray-500" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
        <div className="w-full">
          <Text className="mb-0.5 w-11/12 truncate text-sm font-semibold text-gray-900 dark:text-gray-700">
            {item.title}
          </Text>
          <Text className="text-xs text-gray-500">
            {dayjs(item.createdAt).fromNow()}
          </Text>
        </div>
        <div className="ms-auto flex-shrink-0">
          {!item.isRead ? (
            <Badge renderAsDot size="lg" color="primary" className="scale-90" />
          ) : (
            <span className="inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50">
              <PiCheck className="h-auto w-[9px]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsList({ setIsOpen }: { setIsOpen: (v: boolean) => void }) {
  const { data, isLoading } = useMyNotifications(15);
  const { mutate: markAsRead } = useMarkAsRead();
  const { hasAnyRole } = useAuthRoles();
  const canSeeAllNotifications = hasAnyRole('SUPER_ADMIN', 'ADMIN');
  const notifications: UserNotification[] = data?.data ?? [];

  const handleMarkAll = () => markAsRead(undefined);
  const handleReadOne = (id: number) => markAsRead([id]);

  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-3 flex items-center justify-between px-6">
        <Title as="h5" fontWeight="semibold">
          Notifications
        </Title>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAll}
            className="text-xs text-primary hover:underline"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="custom-scrollbar max-h-[420px] overflow-y-auto scroll-smooth">
        {isLoading ? (
          <div className="px-6 py-4 text-sm text-gray-400">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-6 text-center text-sm text-gray-400">
            Aucune notification
          </div>
        ) : (
          <div className="grid cursor-pointer grid-cols-1 gap-1 px-4">
            {notifications.map((item) => (
              <NotificationItem key={item.id} item={item} onRead={handleReadOne} />
            ))}
          </div>
        )}
      </div>

      {canSeeAllNotifications && (
        <Link
          href={routes.mpme.notifications.list}
          onClick={() => setIsOpen(false)}
          className="block px-6 pb-0.5 pt-3 text-center text-sm hover:underline"
        >
          Voir toutes les notifications
        </Link>
      )}
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: ReactElement & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadData } = useMyUnreadCount();
  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
    >
      <Popover.Trigger>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <NotificationsList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}
