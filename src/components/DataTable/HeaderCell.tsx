import {
  Grid,
  Menu,
  MenuItem,
  IconButton,
  TableCell,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import {
  type Column,
  type ColumnOrderState,
  type Header,
  type Table,
  flexRender,
} from "@tanstack/react-table";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import { useDrag, useDrop } from "react-dnd";
import { Filter } from "./Filter";
import { useState } from "react";

type Props<TData> = {
  header: Header<TData, unknown>;
  table: Table<TData>;
};

const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[],
): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0]!,
  );
  return [...columnOrder];
};

export const HeaderCell = <TData,>({ header, table }: Props<TData>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { getState, setColumnOrder, setGrouping } = table;
  const { columnOrder, grouping } = getState();
  const { column } = header;

  const [, dropRef] = useDrop({
    accept: "column",
    drop: (draggedColumn: Column<TData>) => {
      const isGrouped = draggedColumn.getIsGrouped();
      if (isGrouped) {
        const newGrouping = reorderColumn(
          draggedColumn.id,
          column.id,
          grouping,
        );
        setGrouping(newGrouping);
        return;
      }
      const newColumnOrder = reorderColumn(
        draggedColumn.id,
        column.id,
        columnOrder,
      );
      setColumnOrder(newColumnOrder);
    },
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => column,
    type: "column",
  });

  return (
    <TableCell
      ref={dropRef}
      colSpan={header.colSpan}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Box
        ref={previewRef}
        sx={
          header.column.getCanSort()
            ? { cursor: "pointer", userSelect: "none" }
            : undefined
        }
      >
        <Typography
          onClick={header.column.getToggleSortingHandler()}
          textAlign="start"
        >
          {header.isPlaceholder ? null : (
            <>
              {flexRender(header.column.columnDef.header, header.getContext())}{" "}
              {{
                asc: <ArrowDownwardIcon fontSize="small" />,
                desc: <ArrowUpwardIcon fontSize="small" />,
                false: <SwapVertIcon fontSize="small" />,
              }[header.column.getIsSorted() as string] ?? null}
            </>
          )}
        </Typography>
        <Grid mt={1} container flexWrap="nowrap">
          <Grid item flexGrow={1}>
            {header.column.getCanFilter() && (
              <Filter
                type={header.column.columnDef.filterFn}
                column={header.column}
              />
            )}
          </Grid>
          <Grid item>
            <IconButton
              ref={dragRef}
              onClick={handleClick}
              sx={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
              <FilterAltIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
            >
              <MenuItem
                selected={header.column.getIsSorted() === "asc"}
                onClick={() => header.column.toggleSorting(false, false)}
              >
                <ListItemIcon>
                  <ArrowDownwardIcon />
                </ListItemIcon>
                <ListItemText>Sort Ascending</ListItemText>
              </MenuItem>
              <MenuItem
                selected={header.column.getIsSorted() === "desc"}
                onClick={() => header.column.toggleSorting(true, false)}
              >
                <ListItemIcon>
                  <ArrowUpwardIcon />
                </ListItemIcon>
                <ListItemText>Sort Descending</ListItemText>
              </MenuItem>
              <MenuItem onClick={header.column.getToggleGroupingHandler()}>
                <ListItemIcon>
                  <FeaturedPlayListIcon />
                </ListItemIcon>
                <ListItemText>Toggle Group</ListItemText>
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>
    </TableCell>
  );
};
