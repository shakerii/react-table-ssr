import { Menu, MenuItem, Switch } from "@mui/material";
import type { Table } from "@tanstack/react-table";

type Props<TData> = {
  anchorEl: Element | undefined;
  onClose: () => void;
  table: Table<TData>;
};

export const ColumnSelectorMenu = <TData,>({
  anchorEl,
  onClose,
  table,
}: Props<TData>) => {
  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      {table.getAllLeafColumns().map((column) => {
        return (
          <MenuItem
            key={column.id}
            onClick={column.getToggleVisibilityHandler()}
            sx={{ justifyContent: "space-between" }}
          >
            {String(column.columnDef.header)}
            <Switch checked={column.getIsVisible()} />
          </MenuItem>
        );
      })}
    </Menu>
  );
};
