"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import {
  Box,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  Paper,
  Slide,
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
  type ElementRef,
  FC,
  Fragment,
  type MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { GroupedHeaderBox } from "./GroupedHeaderBox";
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
  DetailComponent: FC<{ row: Row<TData> }>;
  rowActions: RowAction<TData>[];
};

export const DataTable = <TData,>({
  data,
  columns,
  defaultVisibilityState,
  exportToCSV,
  exportToPDF,
  rowActions,
  DetailComponent,
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
  const [overflowColumnList, setOverflowColumnList] = useState<string[]>([]);
  const detailContainerRef = useRef<ElementRef<typeof Paper>>(null);
  const [openDetails, setOpenDetails] = useState<Row<TData>>();
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

  const hasOverflowingColumns = tableRef.current
    ? tableRef.current.offsetWidth < tableRef.current.scrollWidth
    : false;
  const flatHeaders = table.getFlatHeaders();

  useEffect(() => {
    if (!hasOverflowingColumns) return;
    const headers = flatHeaders.slice().reverse();
    if (headers.length - overflowColumnList.length < 2) return;
    setOverflowColumnList((columnList) => {
      for (const header of headers) {
        if (overflowColumnList.includes(header.column.id)) continue;
        return [...columnList, header.column.id];
      }
      return columnList;
    });
  }, [table, overflowColumnList, hasOverflowingColumns]);

  const totalColumns =
    1 +
    grouping.length +
    flatHeaders.length -
    (overflowColumnList.length ? overflowColumnList.length - 1 : 0);

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
        <Box
          sx={{
            border: 1,
            borderColor: (theme) => theme.palette.grey[300],
          }}
        >
          <GroupedHeaderBox table={table} />
          <Divider />
          <TableContainer
            ref={tableRef}
            sx={{
              maxHeight: 500,
              position: "relative",
            }}
          >
            <Slide
              direction="left"
              in={!!openDetails}
              container={tableRef.current}
            >
              <Paper
                elevation={4}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: 5,
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: 6, right: 6 }}
                  onClick={() => setOpenDetails(undefined)}
                >
                  <CloseIcon />
                </IconButton>
                {openDetails && (
                  <Box mt={4} p={2} minWidth={400}>
                    <DetailComponent row={openDetails} />
                  </Box>
                )}
              </Paper>
            </Slide>
            <Table stickyHeader size="small">
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {grouping.map((group) => (
                      <TableCell key={group} sx={{ width: 0 }} />
                    ))}
                    <TableCell>
                      <Checkbox
                        size="small"
                        sx={{ p: 0 }}
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                      />
                    </TableCell>
                    {headerGroup.headers.map(
                      (header) =>
                        !overflowColumnList.includes(header.id) && (
                          <HeaderCell
                            key={header.id}
                            table={table}
                            header={header}
                          />
                        ),
                    )}
                    {!!overflowColumnList.length && <TableCell width={0} />}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => {
                  if (row.getIsGrouped()) {
                    const canExpand = row.getCanExpand();
                    return (
                      <TableRow key={row.id}>
                        {!!row.depth && (
                          <TableCell
                            colSpan={row.depth}
                            sx={{
                              width: 0,
                              backgroundColor: (theme) =>
                                theme.palette.grey[300],
                              cursor: canExpand ? "pointer" : "normal",
                            }}
                            onClick={row.getToggleExpandedHandler()}
                          />
                        )}
                        {row.getVisibleCells().map((cell) => {
                          if (!cell.getIsGrouped()) {
                            return null;
                          }
                          return (
                            <Fragment key={cell.id}>
                              <TableCell
                                sx={{
                                  backgroundColor: (theme) =>
                                    theme.palette.grey[300],
                                  cursor: canExpand ? "pointer" : "normal",
                                }}
                                onClick={row.getToggleExpandedHandler()}
                                align="right"
                              >
                                {row.getIsExpanded() ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
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
                                colSpan={totalColumns - 1}
                              >
                                <Typography variant="body1" textAlign="start">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </Typography>
                              </TableCell>
                            </Fragment>
                          );

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
                        onClick={() => setOpenDetails(row)}
                      >
                        {grouping.map((group) => (
                          <TableCell
                            key={group}
                            sx={{
                              width: 0,
                              backgroundColor: (theme) =>
                                theme.palette.grey[300],
                            }}
                          />
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
                          if (overflowColumnList.includes(cell.column.id)) {
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
                        {row.getCanExpand() && !!overflowColumnList.length && (
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
                          {!!grouping.length && (
                            <TableCell
                              colSpan={row.depth}
                              sx={{
                                width: 0,
                                backgroundColor: (theme) =>
                                  theme.palette.grey[300],
                              }}
                            />
                          )}
                          <TableCell colSpan={totalColumns - row.depth}>
                            <Grid container>
                              {overflowColumnList.map((columnId) => {
                                const column = table.getColumn(columnId);
                                if (!column) {
                                  return null;
                                }
                                const cell = row
                                  .getVisibleCells()
                                  .find((cell) => cell.column === column);
                                if (!cell) {
                                  return null;
                                }
                                return (
                                  <Grid
                                    key={columnId}
                                    item
                                    xs={12}
                                    sm={6}
                                    lg={3}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      textAlign="start"
                                    >
                                      {String(column.columnDef.header)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      textAlign="start"
                                    >
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}
                                    </Typography>
                                  </Grid>
                                );
                              })}
                            </Grid>
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
        </Box>
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
