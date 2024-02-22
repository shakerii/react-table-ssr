"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
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
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
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
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { useIsRTL } from "~/hooks/useIsRTL";
import { useLocalStorage } from "~/hooks/useLocalStorage";

import { GroupedHeaderBox } from "./GroupedHeaderBox";
import { HeaderCell } from "./HeaderCell";
import { RowActionsPopover } from "./RowActionsPopover";
import { TableActions } from "./TableActions";
import { TableNestedRow } from "./TableNestedRow";
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
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>("columnVisibility", {});
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
            flexDirection: isSmUp && pinRowDetails ? "row" : "column",
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
                    return (
                      <TableNestedRow
                        key={row.id}
                        table={table}
                        row={row}
                        grouping={grouping}
                        overflowColumnList={overflowColumnList}
                        totalColumns={totalColumns}
                        rowActions={rowActions}
                      />
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
          {isSmUp && pinRowDetails ? (
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
