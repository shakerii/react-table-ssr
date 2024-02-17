"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
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
import { type ReactElement, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { useIsRTL } from "~/hooks/useIsRTL";

import { DebouncedInput } from "../DebouncedInput";
import { HeaderCell } from "./HeaderCell";
import type { Columns } from "./types";
import {
  exportRowsToCSV,
  exportRowsToPDF,
  fuzzyFilter,
  fuzzySort,
  getTableCellBackgroundColor,
} from "./utils";

type RowAction<TData> = {
  name: string;
  icon?: ReactElement;
  onClick: (row: Row<TData>) => void;
};

type Props<TData> = {
  data: TData[];
  columns: Columns<TData>;
  exportToPDF?: boolean;
  exportToCSV?: boolean;
  onCreate?: () => void;
  onRefresh?: () => void;
  rowActions: RowAction<TData>[];
};

export const DataTable = <TData,>({
  data,
  columns,
  exportToCSV,
  exportToPDF,
  rowActions,
  onCreate,
  onRefresh,
}: Props<TData>) => {
  const t = useTranslations("components.data-table");
  const isRTL = useIsRTL();
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => column.id!),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSelectorAnchorEl, setColumnSelectorAnchorEl] =
    useState<HTMLElement>();

  const [openRowActions, setOpenRowActions] = useState<{
    position: { top: number; left: number };
    row: Row<TData>;
  }>();

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

  return (
    <DndProvider backend={HTML5Backend}>
      <TableContainer component={Paper}>
        <Box p={2}>
          <Box>
            <DebouncedInput
              size="small"
              value={globalFilter}
              placeholder="Filter All"
              onChange={(value) => setGlobalFilter(value as string)}
            />
          </Box>
          <Box mt={1} display="flex" rowGap={2}>
            {onCreate && (
              <Tooltip title={t("create-new")}>
                <IconButton onClick={onCreate}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t("column-selector")}>
              <IconButton
                onClick={(e) => setColumnSelectorAnchorEl(e.currentTarget)}
              >
                <ViewWeekIcon />
              </IconButton>
            </Tooltip>
            {exportToPDF && (
              <Tooltip title={t("export-to-pdf")}>
                <IconButton onClick={handleExportToPDF}>
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
            )}
            {exportToCSV && (
              <Tooltip title={t("export-to-csv")}>
                <IconButton onClick={handleExportToCSV}>
                  <DescriptionIcon />
                </IconButton>
              </Tooltip>
            )}
            {onRefresh && (
              <Tooltip title={t("refresh")}>
                <IconButton onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Menu
            anchorEl={columnSelectorAnchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            open={Boolean(columnSelectorAnchorEl)}
            onClose={() => setColumnSelectorAnchorEl(undefined)}
          >
            {table.getAllLeafColumns().map((column) => {
              return (
                <MenuItem
                  key={column.id}
                  onClick={column.getToggleVisibilityHandler()}
                  sx={{ justifyContent: "space-between" }}
                >
                  <p>{String(column.columnDef.header)}</p>
                  <Switch checked={column.getIsVisible()} />
                </MenuItem>
              );
            })}
          </Menu>
        </Box>
        <Box width="100%" overflow="auto">
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableCell>
                    <Checkbox
                      size="small"
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
                <TableRow
                  key={row.id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setOpenRowActions({
                      row,
                      position: { left: e.clientX, top: e.clientY },
                    });
                  }}
                >
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
                          <Typography variant="body1" textAlign="start">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Typography>
                          <Typography variant="subtitle2" textAlign="start">
                            ({row.subRows.length})
                          </Typography>
                        </Grid>
                      ) : cell.getIsAggregated() ? (
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
                  ))}
                </TableRow>
              ))}
              <Popover
                anchorReference="anchorPosition"
                anchorPosition={openRowActions?.position}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: isRTL ? "right" : "left",
                }}
                open={Boolean(openRowActions)}
                onClose={() => setOpenRowActions(undefined)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setOpenRowActions(undefined);
                }}
              >
                <MenuList>
                  {rowActions.map((action) => {
                    return (
                      <MenuItem
                        key={action.name}
                        onClick={() => {
                          if (!openRowActions) return;
                          action.onClick(openRowActions.row);
                          setOpenRowActions(undefined);
                        }}
                      >
                        {action.icon && (
                          <ListItemIcon>{action.icon}</ListItemIcon>
                        )}
                        <Typography variant="inherit" noWrap>
                          {action.name}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Popover>
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={table.getPrePaginationRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
          labelRowsPerPage={t("rows-per-page")}
          labelDisplayedRows={({ from, to, count }) =>
            t("display-rows", { from, to, count })
          }
        />
      </TableContainer>
    </DndProvider>
  );
};
