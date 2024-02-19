import type { Column, Table } from "@tanstack/react-table";

import { DateFilterInput } from "./DateFilterInput";
import { RangeFilterInput } from "./RangeFilterInput";
import { TextFilterInput } from "./TextFilterInput";

type Props<TData> = {
  table: Table<TData>;
  column: Column<TData, unknown>;
};

export const Filter = <TData,>({ table, column }: Props<TData>) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows.find((row) => row.getValue(column.id))
    ?.getValue(column.id);

  if (typeof firstValue === "number") {
    return <RangeFilterInput column={column} />;
  }

  if (firstValue instanceof Date) {
    return <DateFilterInput column={column} />;
  }

  if (typeof firstValue === "string") {
    return <TextFilterInput column={column} />;
  }

  return null;
};
