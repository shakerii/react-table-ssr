"use client";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { Product } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import {
  type Columns,
  DataTable,
  type RowAction,
} from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { DataTableSkeleton } from "~/components/skeleton/DataTableSkeleton";
import { useIsRTL } from "~/hooks/useIsRTL";
import { api } from "~/trpc/react";
import { localeCodes } from "~/utils/navigation";

export default function Home() {
  const t = useTranslations();
  const isRTL = useIsRTL();
  const locale = useLocale();
  const localeCode =
    locale in localeCodes
      ? localeCodes[locale as keyof typeof localeCodes]
      : "en-US";
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const [product, setProduct] = useState<Product | undefined | null>(undefined);
  const open = product !== undefined;

  const getAllProductQuery = api.product.getAll.useQuery(undefined, {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const createPropertyMutation = api.product.create.useMutation({
    onSuccess: async () => {
      await getAllProductQuery.refetch();
    },
    onSettled: () => {
      setProduct(undefined);
    },
  });

  const updatePropertyMutation = api.product.update.useMutation({
    onSuccess: async () => {
      await getAllProductQuery.refetch();
    },
    onSettled: () => {
      setProduct(undefined);
    },
  });

  const deletePropertyMutation = api.product.delete.useMutation({
    onSuccess: async () => {
      await getAllProductQuery.refetch();
    },
  });

  const columns = useMemo<Columns<Product>>(() => {
    return [
      {
        id: "name",
        accessorKey: "name",
        header: t("data.columns.name"),
        cell: ({ cell }) => (
          <span className="block max-w-72 overflow-hidden text-ellipsis whitespace-nowrap">
            {cell.getValue<string | undefined>()}
          </span>
        ),
        aggregationFn: "count",
        aggregatedCell: ({ getValue }) => (
          <span>
            {t("data.aggregations.count", { count: getValue<number>() })}
          </span>
        ),
        filterFn: "custom",
      },
      {
        id: "description",
        accessorKey: "description",
        header: t("data.columns.description"),
        cell: ({ cell }) => (
          <span className="block max-w-96 overflow-hidden text-ellipsis whitespace-nowrap">
            {cell.getValue<string | undefined>()}
          </span>
        ),
        aggregationFn: "count",
        aggregatedCell: ({ getValue }) => (
          <span>
            {t("data.aggregations.count", { count: getValue<number>() })}
          </span>
        ),
        filterFn: "custom",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: t("data.columns.created-at"),
        cell: ({ cell }) =>
          cell.getValue<Date | undefined>()?.toLocaleDateString(localeCode),
        aggregationFn: "count",
        aggregatedCell: ({ getValue }) => (
          <span>
            {t("data.aggregations.count", { count: getValue<number>() })}
          </span>
        ),
        enableColumnFilter: false,
        filterFn: "inNumberRange",
      },
      {
        id: "updatedAt",
        accessorKey: "updatedAt",
        header: t("data.columns.updated-at"),
        cell: ({ cell }) =>
          cell.getValue<Date | undefined>()?.toLocaleDateString(localeCode),
        aggregationFn: "count",
        aggregatedCell: ({ getValue }) => (
          <span>
            {t("data.aggregations.count", { count: getValue<number>() })}
          </span>
        ),
        enableColumnFilter: false,
        filterFn: "inNumberRange",
      },
    ];
  }, [t, localeCode]);

  const rowActions = useMemo<RowAction<Product>[]>(() => {
    return [
      {
        name: t("data.actions.edit"),
        icon: <EditIcon />,
        onClick: (row) => setProduct(row.original),
      },
      {
        name: t("data.actions.delete"),
        icon: <DeleteIcon />,
        onClick: (row) => deletePropertyMutation.mutate(row.original.id),
      },
    ];
  }, [t, deletePropertyMutation]);

  if (getAllProductQuery.status === "loading") {
    return <DataTableSkeleton />;
  }

  if (getAllProductQuery.status === "error") {
    return "Error";
  }

  const { data } = getAllProductQuery;

  return (
    <>
      <Dialog
        fullWidth
        fullScreen={!isSmUp}
        onClose={() => setProduct(undefined)}
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {product ? t("with-tab.update", product) : t("with-tab.create")}
        </DialogTitle>
        <IconButton
          onClick={() => setProduct(undefined)}
          sx={{
            position: "absolute",
            top: 8,
            color: (theme) => theme.palette.grey[500],
            [isRTL ? "left" : "right"]: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <ProductForm
            defaultValues={product ? product : undefined}
            onSubmit={(values) => {
              product
                ? updatePropertyMutation.mutate({ id: product.id, ...values })
                : createPropertyMutation.mutate(values);
            }}
          />
        </DialogContent>
      </Dialog>
      <DataTable
        data={data}
        columns={columns}
        rowActions={rowActions}
        exportToCSV
        exportToPDF
        DetailComponent={({ row }) => (
          <Box pt={2} px={2} minWidth={400}>
            <ProductForm
              defaultValues={row.original}
              onSubmit={(value) =>
                updatePropertyMutation.mutate({
                  id: row.original.id,
                  ...value,
                })
              }
            />
          </Box>
        )}
        onCreate={() => setProduct(null)}
        onRefresh={() => getAllProductQuery.refetch()}
      />
    </>
  );
}
