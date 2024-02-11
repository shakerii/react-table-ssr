import type { Column } from "@tanstack/react-table";
import { DebouncedInput } from "../DebouncedInput";
import { useCallback } from "react";

type Props<TData> = {
  column: Column<TData, unknown>;
};

export const TextFilterInput = <TData,>({ column }: Props<TData>) => {
  const columnFilterValue = column.getFilterValue();

  const handleChange = useCallback(
    (value: string | number) => column.setFilterValue(value),
    [column],
  );

  return (
    <DebouncedInput
      type="text"
      size="small"
      fullWidth
      value={(columnFilterValue ?? "") as string}
      onChange={handleChange}
      placeholder={`Search...`}
    />
  );
};
