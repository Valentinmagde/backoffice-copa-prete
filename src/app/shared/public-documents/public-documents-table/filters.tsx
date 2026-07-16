'use client';

import { Box, Flex, Input, Title } from 'rizzui';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import ModalButton from '@/app/shared/modal-button';
import CreatePublicDocument from '../create-public-document';

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
  category: string;
  onCategoryChange: (category: string) => void;
}

export default function Filters<TData extends Record<string, any>>({
  table,
  category,
  onCategoryChange,
}: TableToolbarProps<TData>) {
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
          Tous les documents
        </Title>

        <Input
          type="search"
          clearable={true}
          placeholder="Rechercher par titre..."
          value={table.getState().globalFilter ?? ''}
          onClear={() => table.setGlobalFilter('')}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="order-3 h-9 w-full @2xl:order-2 @2xl:ms-auto @2xl:h-auto @2xl:max-w-64 @4xl:order-3"
        />

        <Input
          type="search"
          clearable={true}
          placeholder="Filtrer par catégorie..."
          value={category}
          onClear={() => onCategoryChange('')}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="order-3 h-9 w-full @2xl:order-3 @2xl:h-auto @2xl:max-w-64 @4xl:order-3"
        />

        <Box className="order-2 ms-4 @2xl:order-3 @2xl:ms-0 @4xl:order-4 @4xl:shrink-0">
          <ModalButton
            label="Nouveau document"
            view={<CreatePublicDocument />}
            customSize={700}
            className="mt-0"
          />
        </Box>
      </Flex>
    </Box>
  );
}
