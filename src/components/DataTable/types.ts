import type { RankingInfo } from "@tanstack/match-sorter-utils";
import type { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import type { ReactElement } from "react";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type Columns<TData> = ColumnDef<TData>[];

export type RowAction<TData> = {
  name: string;
  icon?: ReactElement;
  onClick: (row: Row<TData>) => void;
};
