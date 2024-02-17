import type { Column } from "@tanstack/react-table";
import { useCallback } from "react";

import { DebouncedInput } from "../DebouncedInput";

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
      placeholder="Search"
    />
  );
};
