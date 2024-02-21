import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Checkbox,
  Grid,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Row, Table, flexRender } from "@tanstack/react-table";
import { Fragment, useState } from "react";

import { RowActionsPopover } from "./RowActionsPopover";
import { RowAction } from "./types";

type Props<TData> = {
  table: Table<TData>;
  row: Row<TData>;
  grouping: string[];
  totalColumns: number;
  overflowColumnList: string[];
  rowActions: RowAction<TData>[];
};

const SimpleRow = <TData,>({
  table,
  row,
  grouping,
  overflowColumnList,
  totalColumns,
  rowActions,
}: Props<TData>) => {
  const [openRowActions, setOpenRowActions] = useState<{
    position: { top: number; left: number };
    row: Row<TData>;
  }>();

  return (
    <Fragment>
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
              width: 0,
              backgroundColor: (theme) => theme.palette.grey[300],
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
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                backgroundColor: (theme) => theme.palette.grey[300],
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
                  <Grid key={columnId} item xs={12} sm={6} lg={3}>
                    <Typography variant="subtitle1" textAlign="start">
                      {String(column.columnDef.header)}
                    </Typography>
                    <Typography variant="body2" textAlign="start">
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
      <RowActionsPopover
        position={openRowActions?.position}
        row={openRowActions?.row}
        actions={rowActions}
        onClose={() => setOpenRowActions(undefined)}
      />
    </Fragment>
  );
};

export const TableNestedRow = <TData,>({
  table,
  row,
  rowActions,
  grouping,
  overflowColumnList,
  totalColumns,
}: Props<TData>) => {
  if (!row.getIsGrouped()) {
    return (
      <SimpleRow
        table={table}
        row={row}
        totalColumns={totalColumns}
        grouping={grouping}
        overflowColumnList={overflowColumnList}
        rowActions={rowActions}
      />
    );
  }

  const canExpand = row.getCanExpand();
  return (
    <TableRow key={row.id}>
      {!!row.depth && (
        <TableCell
          colSpan={row.depth}
          sx={{
            width: 0,
            backgroundColor: (theme) => theme.palette.grey[300],
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
                backgroundColor: (theme) => theme.palette.grey[300],
                cursor: canExpand ? "pointer" : "normal",
              }}
              onClick={row.getToggleExpandedHandler()}
              align="right"
            >
              {row.getIsExpanded() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </TableCell>
            <TableCell
              key={cell.id}
              sx={{
                backgroundColor: (theme) => theme.palette.grey[300],
                cursor: canExpand ? "pointer" : "normal",
              }}
              onClick={row.getToggleExpandedHandler()}
              colSpan={totalColumns - 1}
            >
              <Typography variant="body1" textAlign="start">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Typography>
            </TableCell>
          </Fragment>
        );

        return (
          <TableCell
            key={cell.id}
            sx={{
              backgroundColor: (theme) => theme.palette.grey[300],
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
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};
