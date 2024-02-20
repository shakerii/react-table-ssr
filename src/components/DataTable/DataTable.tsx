"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import {
  Checkbox,
  IconButton,
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
  type Row,
  type RowSelectionState,
  type VisibilityState,
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
import { useTranslations } from "next-intl";
import {
  ElementRef,
  Fragment,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { HeaderCell } from "./HeaderCell";
import { RowActionsPopover } from "./RowActionsPopover";
import { TableActions } from "./TableActions";
import { customFilter } from "./TextFilterInput";
import type { Columns, RowAction } from "./types";
import {
  exportRowsToCSV,
  exportRowsToPDF,
  fuzzyFilter,
  fuzzySort,
} from "./utils";

type Props<TData> = {
  data: TData[];
  columns: Columns<TData>;
  defaultVisibilityState?: VisibilityState;
  exportToPDF?: boolean;
  exportToCSV?: boolean;
  onCreate?: () => void;
  onRefresh?: () => void;
  rowActions: RowAction<TData>[];
};

export const DataTable = <TData,>({
  data,
  columns,
  defaultVisibilityState,
  exportToCSV,
  exportToPDF,
  rowActions,
  onCreate,
  onRefresh,
}: Props<TData>) => {
  const t = useTranslations("components.data-table");
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => column.id!),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultVisibilityState ?? {},
  );
  const [columnSelectorAnchorEl, setColumnSelectorAnchorEl] =
    useState<Element>();
  const [overflowHeaderList, setOverflowHeaderList] = useState<string[]>([]);
  const tableRef = useRef<ElementRef<typeof Table>>(null);

  const [openRowActions, setOpenRowActions] = useState<{
    position: { top: number; left: number };
    row: Row<TData>;
  }>();

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
      columnFilters,
      globalFilter,
      grouping,
      rowSelection,
      columnVisibility,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
      custom: customFilter,
    },
    sortingFns: {
      fuzzy: fuzzySort,
    },
    enableRowSelection: true,
    paginateExpandedRows: false,
    getRowCanExpand: () => true,
    onColumnOrderChange: setColumnOrder,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
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

  const handleExportToPDF = () => {
    table.getIsSomeRowsSelected()
      ? exportRowsToPDF({
          filename: "Testing export to PDF",
          rows: table.getSelectedRowModel().rows,
          headers: table.getFlatHeaders(),
        })
      : exportRowsToPDF({
          filename: "Testing export to PDF",
          rows: table.getPrePaginationRowModel().rows,
          headers: table.getFlatHeaders(),
        });
  };

  const handleExportToCSV = () => {
    table.getIsSomeRowsSelected()
      ? exportRowsToCSV({
          filename: "Testing export to CSV",
          rows: table.getSelectedRowModel().rows,
          headers: table.getFlatHeaders(),
        })
      : exportRowsToCSV({
          filename: "Testing export to CSV",
          rows: table.getPrePaginationRowModel().rows,
          headers: table.getFlatHeaders(),
        });
  };

  const globalActions = [
    {
      title: t("create-new"),
      icon: <AddCircleIcon />,
      visible: !!onCreate,
      onClick: onCreate,
    },
    {
      title: t("column-selector"),
      icon: <ViewWeekIcon />,
      visible: true,
      onClick: (e: MouseEvent) => setColumnSelectorAnchorEl(e.currentTarget),
    },
    {
      title: t("export-to-pdf"),
      icon: <PictureAsPdfIcon />,
      visible: exportToPDF,
      onClick: handleExportToPDF,
    },
    {
      title: t("export-to-csv"),
      icon: <DescriptionIcon />,
      visible: exportToCSV,
      onClick: handleExportToCSV,
    },
    {
      title: t("refresh"),
      icon: <RefreshIcon />,
      visible: !!onRefresh,
      onClick: onRefresh,
    },
  ];

  const element = tableRef.current;
  const hasOverflowingChildren = element
    ? element.offsetWidth < element.scrollWidth
    : false;

  useEffect(() => {
    if (!hasOverflowingChildren) return;
    const headers = table.getFlatHeaders().slice().reverse();
    if (headers.length - overflowHeaderList.length < 2) return;
    setOverflowHeaderList((list) => {
      for (const header of headers) {
        if (overflowHeaderList.includes(header.id)) continue;
        return [...list, header.id];
      }
      return list;
    });
  }, [table, overflowHeaderList, hasOverflowingChildren]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Paper sx={{ width: "100%", overflow: "hidden", px: 2 }}>
        <TableActions
          table={table}
          actions={globalActions}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          columnSelectorAnchorEl={columnSelectorAnchorEl}
          setColumnSelectorAnchorEl={setColumnSelectorAnchorEl}
        />
        <TableContainer
          ref={tableRef}
          sx={{
            maxHeight: 440,
            border: 1,
            borderColor: (theme) => theme.palette.grey[300],
            scrollBehavior: "unset",
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableCell>
                    <Checkbox
                      size="small"
                      sx={{ p: 0 }}
                      checked={table.getIsAllRowsSelected()}
                      indeterminate={table.getIsSomeRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </TableCell>
                  {grouping.map((group) => (
                    <TableCell key={group}></TableCell>
                  ))}
                  {headerGroup.headers.map(
                    (header) =>
                      !overflowHeaderList.includes(header.id) && (
                        <HeaderCell
                          key={header.id}
                          table={table}
                          header={header}
                        />
                      ),
                  )}
                  {!!overflowHeaderList.length && <TableCell />}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                if (row.getIsGrouped()) {
                  const canExpand = row.getCanExpand();
                  return (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        if (cell.getIsGrouped()) {
                          return (
                            <>
                              <TableCell
                                sx={{
                                  backgroundColor: (theme) =>
                                    theme.palette.grey[300],
                                  cursor: canExpand ? "pointer" : "normal",
                                }}
                                onClick={row.getToggleExpandedHandler()}
                              >
                                {row.getIsExpanded() ? (
                                  <ExpandMoreIcon />
                                ) : (
                                  <ExpandLessIcon />
                                )}
                              </TableCell>
                              <TableCell
                                key={cell.id}
                                sx={{
                                  backgroundColor: (theme) =>
                                    theme.palette.grey[300],
                                  cursor: canExpand ? "pointer" : "normal",
                                }}
                                onClick={row.getToggleExpandedHandler()}
                                colSpan={grouping.length + 2}
                              >
                                <Typography variant="body1" textAlign="start">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </Typography>
                              </TableCell>
                            </>
                          );
                        }

                        return (
                          <TableCell
                            key={cell.id}
                            sx={{
                              backgroundColor: (theme) =>
                                theme.palette.grey[300],
                              cursor: canExpand ? "pointer" : "normal",
                            }}
                            onClick={row.getToggleExpandedHandler()}
                          >
                            {cell.getIsAggregated() ? (
                              <Typography variant="body1" textAlign="start">
                                {flexRender(
                                  cell.column.columnDef.aggregatedCell ??
                                    cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </Typography>
                            ) : cell.getIsPlaceholder() ? null : (
                              <Typography variant="body1" textAlign="start">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                }

                return (
                  <Fragment key={row.id}>
                    <TableRow
                      hover
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setOpenRowActions({
                          row,
                          position: { left: e.clientX, top: e.clientY },
                        });
                      }}
                    >
                      {grouping.map((group) => (
                        <TableCell
                          key={group}
                          sx={{
                            backgroundColor: (theme) => theme.palette.grey[300],
                          }}
                        ></TableCell>
                      ))}
                      <TableCell>
                        <Checkbox
                          size="small"
                          sx={{ p: 0 }}
                          checked={row.getIsSelected()}
                          disabled={!row.getCanSelect()}
                          indeterminate={row.getIsSomeSelected()}
                          onChange={row.getToggleSelectedHandler()}
                        />
                      </TableCell>
                      {row.getVisibleCells().map((cell) => {
                        if (overflowHeaderList.includes(cell.column.id)) {
                          return null;
                        }
                        return (
                          <TableCell key={cell.id}>
                            <Typography textAlign="start">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Typography>
                          </TableCell>
                        );
                      })}
                      {row.getCanExpand() && !!overflowHeaderList.length && (
                        <TableCell>
                          <IconButton
                            size="small"
                            sx={{ p: 0 }}
                            onClick={row.getToggleExpandedHandler()}
                          >
                            <MoreHorizIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell
                          colSpan={
                            row.getVisibleCells().length -
                            overflowHeaderList.length +
                            2
                          }
                        >
                          {overflowHeaderList.toString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              <RowActionsPopover
                position={openRowActions?.position}
                row={openRowActions?.row}
                actions={rowActions}
                onClose={() => setOpenRowActions(undefined)}
              />
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={table.getGroupedRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
          labelRowsPerPage={t("rows-per-page")}
          labelDisplayedRows={({ from, to, count }) =>
            t("display-rows", { from, to, count })
          }
        />
      </Paper>
    </DndProvider>
  );
};
