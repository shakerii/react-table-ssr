import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Column, Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  type Dispatch,
  type MouseEvent,
  type ReactElement,
  type SetStateAction,
} from "react";
import { useDrop } from "react-dnd";

import { DebouncedInput } from "../DebouncedInput";
import { ColumnSelectorMenu } from "./ColumnSelectorMenu";

type Action = {
  title: string;
  icon: ReactElement;
  visible: boolean | undefined;
  onClick: ((e: MouseEvent) => void) | undefined;
};

type Props<TData> = {
  table: Table<TData>;
  actions: Action[];
  globalFilter: string;
  setGlobalFilter: Dispatch<SetStateAction<string>>;
  columnSelectorAnchorEl: Element | undefined;
  setColumnSelectorAnchorEl: Dispatch<SetStateAction<Element | undefined>>;
};

export const TableActions = <TData,>({
  table,
  actions,
  globalFilter,
  setGlobalFilter,
  columnSelectorAnchorEl,
  setColumnSelectorAnchorEl,
}: Props<TData>) => {
  const t = useTranslations("components.data-table.header.actions");

  const [, dropRef] = useDrop<Column<TData>>({
    accept: "column",
    drop: (draggedColumn) => {
      if (draggedColumn.getIsGrouped()) return;
      draggedColumn.toggleGrouping();
    },
  });

  const groupedHeaders = table
    .getHeaderGroups()
    .flatMap((headerGroup) => headerGroup.headers)
    .filter((header) => header.column.getIsGrouped());

  return (
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
        {actions.map((action) => {
          if (!action.visible) return null;
          return (
            <Tooltip key={action.title} title={action.title}>
              <IconButton onClick={action.onClick}>{action.icon}</IconButton>
            </Tooltip>
          );
        })}
        <ColumnSelectorMenu
          anchorEl={columnSelectorAnchorEl}
          onClose={() => setColumnSelectorAnchorEl(undefined)}
          table={table}
        />
      </Box>
      <Stack mt={1} direction="row" spacing={1} ref={dropRef}>
        {groupedHeaders.length === 0 && (
          <Typography>{t("drag-to-group")}</Typography>
        )}
        {groupedHeaders.map((header) => (
          <Chip
            key={header.id}
            label={String(header.column.columnDef.header)}
            onDelete={() => header.column.toggleGrouping()}
          />
        ))}
      </Stack>
    </Box>
  );
};
