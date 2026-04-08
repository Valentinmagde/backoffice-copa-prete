'use client';

import { Badge, Box, Button, Flex, Input, Title, Select, Text } from 'rizzui';
import StatusField from '@core/components/controlled-table/status-field';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { PiMagnifyingGlassBold, PiTrashDuotone, PiPlus } from 'react-icons/pi';
import ModalButton from '@/app/shared/modal-button';
import CreateCohort from '../create-cohorte';
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  // { value: 'pending', label: 'En attente' },
];

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
}

export default function Filters<TData extends Record<string, any>>({
  table,
}: TableToolbarProps<TData>) {
  const isFiltered = table.getState().globalFilter || table.getState().columnFilters.length > 0;

  return (
    <Box className="mb-4 @container">
      <Flex
        gap="3"
        align="center"
        justify="between"
        className="w-full flex-wrap @4xl:flex-nowrap"
      >
        <Title
          as="h3"
          className="rizzui-title-h3 order-1 whitespace-nowrap pe-4 text-base font-semibold sm:text-lg"
        >
          Toutes les cohortes
        </Title>

        <Flex
          align="center"
          direction="col"
          gap="2"
          className="order-4 @lg:grid @lg:grid-cols-2 @4xl:order-2 @4xl:flex @4xl:flex-row"
        >
          <StatusField
            placeholder="Filtrer par statut"
            options={statusOptions}
            value={table.getColumn('isActive')?.getFilterValue() ?? []}
            onChange={(e) => table.getColumn('isActive')?.setFilterValue(e)}
            getOptionValue={(option) => option.value}
            dropdownClassName="!z-10 h-auto"
            className="@4xl:w-40"
            getOptionDisplayValue={(option) => renderStatusOption(option.value)}
            displayValue={(selected: string) => renderStatusOption(selected)}
          />

          {isFiltered && (
            <Button
              size="sm"
              onClick={() => {
                table.resetGlobalFilter();
                table.resetColumnFilters();
              }}
              variant="flat"
              className="h-9 w-full bg-gray-200/70 @lg:col-span-full @4xl:w-auto"
            >
              <PiTrashDuotone className="me-1.5 size-[17px]" /> Réinitialiser
            </Button>
          )}
        </Flex>

        <Input
          type="search"
          clearable={true}
          placeholder="Rechercher par nom..."
          value={table.getState().globalFilter ?? ''}
          onClear={() => table.setGlobalFilter('')}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="order-3 h-9 w-full @2xl:order-2 @2xl:ms-auto @2xl:h-auto @2xl:max-w-64 @4xl:order-3"
        />

        <Box className="order-2 ms-4 @2xl:order-3 @2xl:ms-0 @4xl:order-4 @4xl:shrink-0">
          <ModalButton
            label="Nouvelle cohorte"
            view={<CreateCohort />}
            customSize={600}
            className="mt-0"
          />
        </Box>
      </Flex>
    </Box>
  );
}

function renderStatusOption(value: string) {
  switch (value) {
    case 'active':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">Active</Text>
        </div>
      );
    case 'inactive':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">Inactive</Text>
        </div>
      );
    case 'pending':
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-orange-dark" />
          <Text className="ms-2 font-medium capitalize text-orange-dark">En attente</Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium capitalize text-gray-600">{value}</Text>
        </div>
      );
  }
}