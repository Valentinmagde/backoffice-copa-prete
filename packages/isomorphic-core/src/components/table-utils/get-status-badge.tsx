"use client";

import cn from "@core/utils/class-names";
import { Badge, Flex, Text } from "rizzui";
import { replaceUnderscoreDash } from "@core/utils/replace-underscore-dash";

const statusColors = {
  success: ["text-green-dark", "bg-green-dark"],
  warning: ["text-orange-dark", "bg-orange-dark"],
  danger: ["text-red-dark", "bg-red-dark"],
  default: ["text-gray-600", "bg-gray-600"],
  primary: ["text-blue-600", "bg-blue-600"],
};

const allStatus = {
  online: statusColors.success,
  offline: statusColors.default,
  pending: statusColors.warning,
  paid: statusColors.success,
  overdue: statusColors.danger,
  completed: statusColors.success,
  cancelled: statusColors.danger,
  publish: statusColors.success,
  approved: statusColors.success,
  rejected: statusColors.danger,
  active: statusColors.success,
  inactive: statusColors.danger,
  deactivated: statusColors.danger,
  on_going: statusColors.warning,
  at_risk: statusColors.danger,
  delayed: statusColors.default,
  draft: statusColors.default,
  refunded: statusColors.default,
  burundais: statusColors.success,
  refugier: statusColors.default,
  présélectionné: statusColors.primary,
  pre_selected: statusColors.primary,
  "pré-sélectionné": statusColors.primary,
  sélectionné: statusColors.success,
  rejeté: statusColors.danger,
  en_évaluation: statusColors.warning,
};

export type StatusTypes = keyof typeof allStatus;

export function getStatusBadge(status: string) {
  const statusStr = typeof status === 'string' ? status : String(status || '');
  const statusLower = statusStr.toLowerCase() as StatusTypes;
  if (statusLower in allStatus) {
    return (
      <Flex align="center" gap="2" className="w-auto">
        <Badge renderAsDot className={allStatus[statusLower][1]} />
        <Text
          className={cn("font-medium capitalize", allStatus[statusLower][0])}
        >
          {replaceUnderscoreDash(statusLower)}
        </Text>
      </Flex>
    );
  }
  return (
    <Flex align="center" gap="2" className="w-auto">
      <Badge renderAsDot className="bg-gray-600" />
      <Text className="font-medium capitalize text-gray-600">
        {replaceUnderscoreDash(statusLower)}
      </Text>
    </Flex>
  );
}
