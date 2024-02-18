import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography } from "@mui/material";
import { type ReactElement } from "react";

import type { Comparable } from "~/utils/types";

export type TabContext<TKey extends Comparable> = {
  key: TKey;
  label: string;
  content: ReactElement;
  onClose?: () => void;
};

type Props<TKey extends Comparable> = {
  tabs: TabContext<TKey>[];
  value: number;
  onChange: (value: number) => void;
};

export const Tabs = <TKey extends Comparable>({
  tabs,
  value,
  onChange,
}: Props<TKey>) => {
  return (
    <Box width="100%">
      <Box display="flex" mb="-1px" width="100%">
        {tabs.map((tab, index) => {
          const selected = index === value;
          return (
            <Box
              key={tab.key}
              onClick={() => onChange(index)}
              sx={{
                minWidth: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
                backgroundColor: selected ? "white" : "lightgray",
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                border: "1px solid gray",
                borderBottom: selected ? 0 : undefined,
              }}
            >
              <Typography>{tab.label}</Typography>
              {tab.onClose && (
                <IconButton size="small" onClick={tab.onClose} sx={{ mx: -1 }}>
                  <CloseIcon fontSize="small" color="inherit" />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          border: "1px solid gray",
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
        }}
      >
        {tabs.map((tab, index) => (
          <Box
            key={tab.key}
            sx={{ display: value === index ? "block" : "none" }}
          >
            {tab.content}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
