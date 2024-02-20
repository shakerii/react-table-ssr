import { Box, IconButton, Tooltip } from "@mui/material";
import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  type Dispatch,
  type MouseEvent,
  type ReactElement,
  type SetStateAction,
} from "react";

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

  return (
    <Box
      py={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <DebouncedInput
        size="small"
        value={globalFilter}
        placeholder={t("filter-all")}
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
  );
};
