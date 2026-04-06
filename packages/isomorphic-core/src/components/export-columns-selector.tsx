'use client';

import { useState } from 'react';
import { Popover, Checkbox, Button } from 'rizzui';
import { PiArrowLineUpBold, PiColumns, PiDownloadSimple } from 'react-icons/pi';
import cn from '@core/utils/class-names';

interface ExportColumnsSelectorProps {
  columns: { key: string; label: string }[];
  defaultSelected?: string[];
  onExport: (selectedColumns: { key: string; label: string }[]) => void;
  data: any[];
  fileName: string;
}

export default function ExportColumnsSelector({
  columns,
  defaultSelected,
  onExport,
  data,
  fileName,
}: ExportColumnsSelectorProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    defaultSelected || columns.map(c => c.key)
  );

  const handleExport = () => {
    const selectedColumns = columns.filter(col => selectedKeys.includes(col.key));
    onExport(selectedColumns);
  };

  const handleSelectAll = () => {
    setSelectedKeys(columns.map(c => c.key));
  };

  const handleDeselectAll = () => {
    setSelectedKeys([]);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className={cn('w-full @lg:w-auto')}
    >
      <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
      Export
    </Button>
  );
}