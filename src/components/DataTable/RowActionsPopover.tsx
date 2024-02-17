import {
  ListItemIcon,
  MenuItem,
  MenuList,
  Popover,
  type PopoverPosition,
  Typography,
} from "@mui/material";
import type { Row } from "@tanstack/react-table";

import { useIsRTL } from "~/hooks/useIsRTL";

import type { RowAction } from "./types";

type Props<TData> = {
  position: PopoverPosition | undefined;
  row: Row<TData> | undefined;
  actions: RowAction<TData>[];
  onClose: () => void;
};

export const RowActionsPopover = <TData,>({
  row,
  position,
  actions,
  onClose,
}: Props<TData>) => {
  const isRTL = useIsRTL();

  return (
    <Popover
      anchorReference="anchorPosition"
      anchorPosition={position}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: isRTL ? "right" : "left",
      }}
      open={Boolean(row)}
      onClose={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <MenuList>
        {actions.map((action) => {
          return (
            <MenuItem
              key={action.name}
              onClick={() => {
                if (!row) return;
                action.onClick(row);
                onClose();
              }}
            >
              {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
              <Typography variant="inherit" noWrap>
                {action.name}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Popover>
  );
};
