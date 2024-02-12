"use client";

import {
  Box,
  Checkbox,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type GroupingState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type ReactNode, useState } from "react";
import type { Columns } from "./types";
import { HeaderCell } from "./HeaderCell";
import { fuzzyFilter, fuzzySort, getTableCellBackgroundColor } from "./utils";
import { DebouncedInput } from "../DebouncedInput";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

type Props<TData> = {
  data: TData[];
  columns: Columns<TData>;
  GlobalActions?: ReactNode;
};

export const DataTable = <TData,>({
  data,
  columns,
  GlobalActions,
}: Props<TData>) => {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => column.id!),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
      columnFilters,
      globalFilter,
      grouping,
      rowSelection,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    sortingFns: {
      fuzzy: fuzzySort,
    },
    enableRowSelection: true,
    onColumnOrderChange: setColumnOrder,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Box>
        <Grid container alignItems="center">
          <Grid item flex={1}>
            <DebouncedInput
              label="Filter All..."
              value={globalFilter}
              onChange={(value) => setGlobalFilter(value as string)}
            />
          </Grid>
          <Grid item>{GlobalActions}</Grid>
        </Grid>
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableCell>
                    <Checkbox
                      checked={table.getIsAllRowsSelected()}
                      indeterminate={table.getIsSomeRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </TableCell>
                  {headerGroup.headers.map((header) => (
                    <HeaderCell key={header.id} header={header} table={table} />
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.getIsGrouped() ? (
                      <Checkbox
                        checked={row.getIsAllSubRowsSelected()}
                        disabled={!row.getCanSelectSubRows()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    ) : (
                      <Checkbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    )}
                  </TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      sx={{
                        cursor: row.getCanExpand() ? "pointer" : "normal",
                        backgroundColor: getTableCellBackgroundColor(cell),
                      }}
                      onClick={row.getToggleExpandedHandler()}
                    >
                      {cell.getIsGrouped() ? (
                        <Grid container gap={1} flexWrap="nowrap">
                          {row.getIsExpanded() ? (
                            <ExpandMoreIcon />
                          ) : (
                            <ExpandLessIcon />
                          )}
                          <Typography variant="body1">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Typography>
                          <Typography variant="subtitle2">
                            ({row.subRows.length})
                          </Typography>
                        </Grid>
                      ) : cell.getIsAggregated() ? (
                        flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      ) : cell.getIsPlaceholder() ? null : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={table.getPrePaginationRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => table.setPageIndex(page)}
            onRowsPerPageChange={(e) =>
              table.setPageSize(Number(e.target.value))
            }
          />
        </TableContainer>
      </Box>
    </DndProvider>
  );
};
