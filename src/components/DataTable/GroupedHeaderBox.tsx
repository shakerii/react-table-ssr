import { Box, Chip, Stack, Typography } from "@mui/material";
import { Column, Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useDrop } from "react-dnd";

type Props<TData> = {
  table: Table<TData>;
};

export const GroupedHeaderBox = <TData,>({ table }: Props<TData>) => {
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
    <Box
      p={2}
      borderBottom={1}
      borderColor={(theme) => theme.palette.grey[300]}
    >
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
  );
};
