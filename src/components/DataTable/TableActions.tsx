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
    <Box py={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <DebouncedInput
          size="small"
          value={globalFilter}
          placeholder="Filter All"
          onChange={(value) => setGlobalFilter(value as string)}
        />
        <Box display="flex" rowGap={2}>
          {actions.map((action) => {
            if (!action.visible) return null;
            return (
              <Tooltip key={action.title} title={action.title}>
                <IconButton onClick={action.onClick}>{action.icon}</IconButton>
              </Tooltip>
            );
          })}
          <ColumnSelectorMenu
            table={table}
            anchorEl={columnSelectorAnchorEl}
            onClose={() => setColumnSelectorAnchorEl(undefined)}
          />
        </Box>
      </Box>
      <Box mt={2} p={1} border="1px dashed" borderRadius={2}>
        <Stack direction="row" spacing={1} ref={dropRef}>
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
    </Box>
  );
};
