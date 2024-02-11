import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import { Cell, FilterMeta, Row, sortingFns } from "@tanstack/react-table";

export const fuzzyFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  value: string,
  addMeta: (meta: FilterMeta) => void,
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export const fuzzySort = <TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
) => {
  let dir = 0;

  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]!.itemRank,
      rowB.columnFiltersMeta[columnId]!.itemRank,
    );
  }

  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export const getTableCellBackgroundColor = <TData>(
  cell: Cell<TData, unknown>,
) => {
  if (cell.getIsGrouped()) return "#EEE";
  if (cell.getIsAggregated()) return "#BBB";
  if (cell.getIsPlaceholder()) return "#999";
  return "#fff";
};
