import type { Column, FilterFnOption } from "@tanstack/react-table";
import { TextFilterInput } from "./TextFilterInput";
import { RangeFilterInput } from "./RangeFilterInput";

type Props<TData> = {
  type: FilterFnOption<TData> | undefined;
  column: Column<TData, unknown>;
};

export const Filter = <TData,>({ type, column }: Props<TData>) => {
  if (type === "inNumberRange") {
    return <RangeFilterInput column={column} />;
  }

  return <TextFilterInput column={column} />;
};
