import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TableCell,
  Typography,
} from "@mui/material";
import {
  type Column,
  type ColumnOrderState,
  type Header,
  type Table,
  flexRender,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";

import { Filter } from "./Filter";

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

const sortIcons = {
  asc: <ArrowDownwardIcon fontSize="small" />,
  desc: <ArrowUpwardIcon fontSize="small" />,
  false: <SwapVertIcon fontSize="small" />,
};

export const HeaderCell = <TData,>({ header, table }: Props<TData>) => {
  const t = useTranslations("components.data-table.header.actions");

  const [optionsAnchorEl, setOptionsAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const optionsOpen = Boolean(optionsAnchorEl);

  const handleClickOptions = (event: React.MouseEvent<HTMLElement>) => {
    setOptionsAnchorEl(event.currentTarget);
  };

  const handleCloseOptions = () => {
    setOptionsAnchorEl(null);
  };

  const { getState, setColumnOrder, setGrouping } = table;
  const { columnOrder, grouping } = getState();
  const { column } = header;

  const [, dropRef] = useDrop<Column<TData>>({
    accept: "column",
    drop: (draggedColumn) => {
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

  const isGrouped = header.column.getIsGrouped();
  const sorted = header.column.getIsSorted();

  const actions = [
    {
      title: t("sort.asc"),
      icon: <ArrowDownwardIcon />,
      selected: sorted === "asc",
      disabled: false,
      onClick: () =>
        sorted === "asc"
          ? header.column.clearSorting()
          : header.column.toggleSorting(false, false),
    },
    {
      title: t("sort.desc"),
      icon: <ArrowUpwardIcon />,
      selected: sorted === "desc",
      disabled: false,
      onClick: () =>
        sorted === "desc"
          ? header.column.clearSorting()
          : header.column.toggleSorting(true, false),
    },
    {
      title: isGrouped ? t("ungroup") : t("group"),
      icon: <FeaturedPlayListIcon />,
      selected: false,
      disabled: false,
      onClick: header.column.getToggleGroupingHandler(),
    },
  ];

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
          noWrap
          onClick={header.column.getToggleSortingHandler()}
          textAlign="start"
        >
          {header.isPlaceholder ? null : (
            <>
              {flexRender(header.column.columnDef.header, header.getContext())}{" "}
              {sortIcons[sorted as keyof typeof sortIcons] ?? null}
            </>
          )}
        </Typography>
        <Box mt={1} display="flex" flexWrap="nowrap">
          <Box flexGrow={1}>
            <Filter
              type={header.column.columnDef.filterFn}
              column={header.column}
            />
          </Box>
          <Box>
            <IconButton
              ref={dragRef}
              onClick={handleClickOptions}
              sx={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={optionsAnchorEl}
              open={optionsOpen}
              onClose={handleCloseOptions}
              onClick={handleCloseOptions}
            >
              {actions.map((action) => {
                return (
                  <MenuItem
                    key={action.title}
                    selected={action.selected}
                    disabled={action.disabled}
                    onClick={action.onClick}
                  >
                    <ListItemIcon>{action.icon}</ListItemIcon>
                    <ListItemText>{action.title}</ListItemText>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>
        </Box>
      </Box>
    </TableCell>
  );
};
