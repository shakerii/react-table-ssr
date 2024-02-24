import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import {
  type FilterMeta,
  type Header,
  type Row,
  sortingFns,
} from "@tanstack/react-table";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { MinMax } from "./types";

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
  if (!rowA.columnFiltersMeta[columnId]) {
    return 0;
  }

  const dir = compareItems(
    rowA.columnFiltersMeta[columnId]!.itemRank,
    rowB.columnFiltersMeta[columnId]!.itemRank,
  );
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export const dateFilter = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: MinMax,
) => {
  const [min, max] = filterValue;
  const value = row.getValue<Date>(columnId);

  if (min && max) {
    return value <= new Date(max) && value >= new Date(min);
  }

  if (max) {
    return value <= new Date(max);
  }

  if (min) {
    return value >= new Date(min);
  }

  return true;
};

export const exportRowsToPDF = <TData>({
  filename,
  rows,
  headers,
}: {
  filename: string;
  rows: Row<TData>[];
  headers: Header<TData, unknown>[];
}) => {
  const doc = new jsPDF();
  const tableData = rows.map((row) =>
    headers.map((header) => row.getValue<string>(header.column.id)),
  );
  const tableHeaders = headers.map((header) =>
    String(header.column.columnDef.header),
  );

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
  });

  doc.save(`${filename}.pdf`);
};

export const exportRowsToCSV = <TData>({
  filename,
  rows,
  headers,
}: {
  filename: string;
  rows: Row<TData>[];
  headers: Header<TData, unknown>[];
}) => {
  const csvConfig = mkConfig({
    filename,
    fieldSeparator: ",",
    decimalSeparator: ".",
    columnHeaders: headers.map((header) => ({
      key: header.column.id,
      displayLabel: String(header.column.columnDef.header),
    })),
  });
  const rowData = rows.map((row) => row.original as Record<string, unknown>);
  const csv = generateCsv(csvConfig)(rowData);
  download(csvConfig)(csv);
};
