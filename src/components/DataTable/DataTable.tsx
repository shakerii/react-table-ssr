"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import {
  Box,
  Checkbox,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
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
  useMediaQuery,
  useTheme,
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
  type FC,
  Fragment,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { useIsRTL } from "~/hooks/useIsRTL";

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
  const isRTL = useIsRTL();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
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
  const [openRowDetails, setOpenRowDetails] = useState<Row<TData>>();
  const [pinRowDetails, setPinRowDetails] = useState(false);
  const [isZoomFullScreen, setIsZoomFullScreen] = useState(false);

  const tableRef = useRef<ElementRef<typeof Table>>(null);
  const containerRef = useRef<ElementRef<"div">>(null);
  const groupedHeaderRef = useRef<ElementRef<"div">>(null);

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
      title: isZoomFullScreen
        ? t("header.actions.undo-zoom")
        : t("header.actions.zoom-to-fullscreen"),
      icon: isZoomFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />,
      visible: true,
      onClick: () => setIsZoomFullScreen((isZoom) => !isZoom),
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
  }, [table, overflowColumnList, hasOverflowingColumns, flatHeaders]);

  const totalColumns =
    1 +
    grouping.length +
    flatHeaders.length -
    (overflowColumnList.length ? overflowColumnList.length - 1 : 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <Paper
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          px: 2,
        }}
      >
        <TableActions
          table={table}
          actions={globalActions}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          columnSelectorAnchorEl={columnSelectorAnchorEl}
          setColumnSelectorAnchorEl={setColumnSelectorAnchorEl}
        />
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: pinRowDetails ? "row" : "column",
            border: 1,
            borderColor: (theme) => theme.palette.grey[300],
          }}
        >
          <Box flexGrow={1}>
            <Box ref={groupedHeaderRef}>
              <GroupedHeaderBox table={table} />
              <Divider />
            </Box>
            <TableContainer
              ref={tableRef}
              sx={{
                maxHeight:
                  containerRef.current && groupedHeaderRef.current
                    ? containerRef.current.clientHeight -
                      groupedHeaderRef.current.clientHeight
                    : "500px",
                position: "relative",
              }}
            >
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
                          onClick={() => setOpenRowDetails(row)}
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
                          {row.getCanExpand() &&
                            !!overflowColumnList.length && (
                              <TableCell>
                                <IconButton
                                  size="small"
                                  sx={{ p: 0 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    row.toggleExpanded();
                                  }}
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
          {pinRowDetails ? (
            <Box
              key={openRowDetails?.id}
              borderRight={isRTL ? 1 : 0}
              borderLeft={isRTL ? 0 : 1}
              borderBottom={1}
              borderColor={(theme) => theme.palette.grey[300]}
            >
              <DialogTitle display="flex" justifyContent="start" sx={{ p: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setOpenRowDetails(undefined)}
                >
                  <CloseIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPinRowDetails((pin) => !pin)}
                >
                  {pinRowDetails ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ p: 0 }}>
                {openRowDetails && <DetailComponent row={openRowDetails} />}
              </DialogContent>
            </Box>
          ) : (
            <Drawer
              open={!!openRowDetails}
              anchor={isRTL ? "left" : "right"}
              hideBackdrop
              PaperProps={{
                style: {
                  position: "absolute",
                  width: isSmUp ? "max-content" : "100%",
                },
              }}
              ModalProps={{
                container: tableRef.current,
                style: { position: "absolute" },
              }}
            >
              <DialogTitle display="flex" justifyContent="start" sx={{ p: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => setOpenRowDetails(undefined)}
                >
                  <CloseIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPinRowDetails((pin) => !pin)}
                >
                  {pinRowDetails ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ p: 0 }}>
                {openRowDetails && <DetailComponent row={openRowDetails} />}
              </DialogContent>
            </Drawer>
          )}
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
