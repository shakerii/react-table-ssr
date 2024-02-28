import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Box, IconButton, ListItemText, Menu, MenuItem } from "@mui/material";
import type { Column } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { type ComponentProps, useMemo, useState } from "react";
import { DatePicker } from "zaman";

import { type MinMax } from "./types";

type Props<TData> = {
  column: Column<TData, unknown>;
};

type Locale = ComponentProps<typeof DatePicker>["locale"];

type FilterOption = "lt" | "mt" | "bw";

const FilterInput = ({
  filterOption,
  filterValue,
  onChange,
}: {
  filterOption: FilterOption;
  filterValue: MinMax;
  onChange: (newValue: MinMax) => void;
}) => {
  const locale = useLocale();

  const minValue = filterValue?.[0];
  const maxValue = filterValue?.[1];

  if (filterOption === "bw") {
    const rangeValue = [] as Date[];
    if (minValue) rangeValue.push(new Date(minValue));
    if (maxValue) rangeValue.push(new Date(maxValue));

    return (
      <DatePicker
        inputClass="date-filter-input"
        round="x4"
        rangeValue={rangeValue}
        position="center"
        range
        onChange={({ from, to }) => {
          onChange([from.getTime(), to.getTime()]);
        }}
        locale={locale as Locale}
      />
    );
  }

  return (
    <DatePicker
      inputClass="date-filter-input"
      round="x4"
      position="center"
      defaultValue={filterOption === "lt" ? maxValue : minValue}
      onChange={({ value }) => {
        onChange(
          filterOption === "lt"
            ? [undefined, value.getTime()]
            : [value.getTime(), undefined],
        );
      }}
      locale={locale as Locale}
    />
  );
};

export const DateFilterInput = <TData,>({ column }: Props<TData>) => {
  const t = useTranslations("components.data-table.header.filters");

  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const filterOpen = Boolean(filterAnchorEl);
  const columnFilterValue = column.getFilterValue() as MinMax;

  const [filterOption, setFilterOption] = useState<FilterOption>("bw");

  const filterOptions = useMemo(() => {
    return [
      {
        label: t("less-than"),
        value: "lt",
      },
      {
        label: t("more-than"),
        value: "mt",
      },
      {
        label: t("between"),
        value: "bw",
      },
    ] as const;
  }, [t]);

  const handleClickFilter = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="nowrap"
      width="100%"
      gap={1}
    >
      <FilterInput
        filterOption={filterOption}
        filterValue={columnFilterValue}
        onChange={(value) => column.setFilterValue(value)}
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
              onClick={() => {
                column.setFilterValue(undefined);
                setFilterOption(value);
              }}
            >
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};
