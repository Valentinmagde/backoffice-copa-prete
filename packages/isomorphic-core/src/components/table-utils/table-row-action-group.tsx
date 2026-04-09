"use client";

import EyeIcon from "@core/components/icons/eye";
import PencilIcon from "@core/components/icons/pencil";
import { ActionIcon, Flex, Tooltip } from "rizzui";
import Link from "next/link";
import cn from "@core/utils/class-names";
import DeletePopover from "../delete-popover";
import { useSearchParams } from "next/navigation";

export default function TableRowActionGroup({
  onDelete,
  editUrl = "#",
  viewUrl = "#",
  deletePopoverTitle = "Delete the appointment",
  deletePopoverDescription = "Are you sure you want to delete this item?",
  className,
  hasEdit = true,
  hasView = true,
  hasDelete = true,
  preserveQueryParams = true,
}: {
  onDelete?: () => void;
  editUrl?: string;
  viewUrl?: string;
  deletePopoverTitle?: string;
  deletePopoverDescription?: string;
  className?: string;
  hasEdit?: boolean;
  hasView?: boolean;
  hasDelete?: boolean;
  preserveQueryParams?: boolean;
}) {
  const searchParams = useSearchParams();

  const buildUrlWithParams = (baseUrl: string) => {
    if (!preserveQueryParams) return baseUrl;
    
    const currentParams = searchParams.toString();
    if (!currentParams) return baseUrl;
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${currentParams}`;
  };

  const viewUrlWithParams = buildUrlWithParams(viewUrl);
  const editUrlWithParams = buildUrlWithParams(editUrl);

  return (
    <Flex
      align="center"
      justify="end"
      gap="3"
      className={cn("pe-3", className)}
    >
      {hasEdit &&
        <Tooltip size="sm" content="Modifier l'élément" placement="top" color="invert">
          <Link href={editUrlWithParams}>
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label="Edit Item"
            >
              <PencilIcon className="size-4" />
            </ActionIcon>
          </Link>
        </Tooltip>}
      {hasView &&
        <Tooltip size="sm" content="Voir l'élément" placement="top" color="invert">
          <Link href={viewUrlWithParams}>
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label="View item"
            >
              <EyeIcon className="size-4" />
            </ActionIcon>
          </Link>
        </Tooltip>}
      {hasDelete && <DeletePopover
        title={deletePopoverTitle}
        description={deletePopoverDescription}
        onDelete={onDelete}
      />}
    </Flex>
  );
}
