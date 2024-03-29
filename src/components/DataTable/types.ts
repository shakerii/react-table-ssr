import type { RankingInfo } from "@tanstack/match-sorter-utils";
import type { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import type { ReactElement } from "react";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
    date: FilterFn<unknown>;
    custom: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type CustomFilterOption = "contains" | "not-contains" | "equals";

export type Columns<TData> = ColumnDef<TData>[];

export type MinMax = [number | undefined, number | undefined];

export type RowAction<TData> = {
  name: string;
  icon?: ReactElement;
  onClick: (row: Row<TData>) => void;
};
