import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Box, IconButton, ListItemText, Menu, MenuItem } from "@mui/material";
import type { Column, Row } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { DebouncedInput } from "../DebouncedInput";
import type { CustomFilterOption } from "./types";

type Props<TData> = {
  column: Column<TData, unknown>;
};

type TValue = [CustomFilterOption | undefined, string | undefined];

const defaultFilterOption: CustomFilterOption = "contains";

const parseFilterValue = (value: string | undefined) => {
  return value
    ? (JSON.parse(value) as TValue)
    : ([defaultFilterOption, ""] as TValue);
};

const changeValue = (filterValue: string | undefined, newValue: string) => {
  const [filterOption] = parseFilterValue(filterValue);
  return JSON.stringify([filterOption, newValue]);
};

const changeFilterOption = (
  filterValue: string | undefined,
  newFilterOption: string | undefined,
) => {
  const [, value] = parseFilterValue(filterValue);
  return JSON.stringify([newFilterOption ?? defaultFilterOption, value]);
};

const filterFns = {
  contains: (cellValue: string, filteredValue: string) =>
    cellValue.includes(filteredValue),
  "not-contains": (cellValue: string, filteredValue: string) =>
    !cellValue.includes(filteredValue),
  equals: (cellValue: string, filteredValue: string) =>
    cellValue === filteredValue,
};

export const customFilter = <TData,>(
  row: Row<TData>,
  columnId: string,
  filterValue: string,
) => {
  const [filterOption, value] = parseFilterValue(filterValue);
  if (!filterOption || !value) {
    return true;
  }
  const filterFn = filterFns[filterOption];
  const cellValue = row.getValue<string>(columnId);
  return filterFn(cellValue, value);
};

export const TextFilterInput = <TData,>({ column }: Props<TData>) => {
  const t = useTranslations("components.data-table.header.filters");
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const filterOpen = Boolean(filterAnchorEl);

  const columnFilterValue = column.getFilterValue() as string;
  const [filterOption, value] = parseFilterValue(columnFilterValue);

  const handleChange = useCallback(
    (value: string | number) =>
      column.setFilterValue((filterValue: string) =>
        changeValue(filterValue, value as string),
      ),
    [column],
  );

  const filterOptions = useMemo(() => {
    return [
      {
        label: t("contains"),
        value: "contains",
      },
      {
        label: t("not-contains"),
        value: "not-contains",
      },
      {
        label: t("equals"),
        value: "equals",
      },
    ];
  }, [t]);

  const handleClickFilter = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  return (
    <Box display="flex" flexGrow={1}>
      <DebouncedInput
        type="text"
        size="small"
        fullWidth
        value={value ?? ""}
        inputProps={{ style: { minWidth: 75, padding: "5px 10px" } }}
        onChange={handleChange}
        placeholder={t("search")}
      />
      <IconButton size="small" onClick={handleClickFilter}>
        <FilterAltIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={filterAnchorEl}
        open={filterOpen}
        onClose={handleCloseFilter}
        onClick={handleCloseFilter}
      >
        {filterOptions.map(({ label, value }) => {
          return (
            <MenuItem
              key={value}
              selected={value === filterOption}
              onClick={() =>
                column.setFilterValue((filterValue: string) => {
                  return changeFilterOption(filterValue, value);
                })
              }
            >
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};
