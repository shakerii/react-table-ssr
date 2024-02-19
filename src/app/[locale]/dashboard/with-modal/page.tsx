"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
  type VisibilityState,
} from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { DataTableSkeleton } from "~/components/skeleton/DataTableSkeleton";
import { api } from "~/trpc/react";
import { localeCodes } from "~/utils/navigation";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const localeCode =
    locale in localeCodes
      ? localeCodes[locale as keyof typeof localeCodes]
      : "en-US";
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const [product, setProduct] = useState<Product | undefined | null>(undefined);
  const open = product !== undefined;
  const [fullWidth, setFullWidth] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

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
        filterFn: "custom",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: t("data.columns.created-at"),
        cell: ({ cell }) =>
          cell.getValue<Date | undefined>()?.toLocaleDateString(localeCode),
        aggregatedCell: () => undefined,
        enableColumnFilter: false,
        filterFn: "inNumberRange",
      },
      {
        id: "updatedAt",
        accessorKey: "updatedAt",
        header: t("data.columns.updated-at"),
        cell: ({ cell }) =>
          cell.getValue<Date | undefined>()?.toLocaleDateString(localeCode),
        aggregatedCell: () => undefined,
        enableColumnFilter: false,
        filterFn: "inNumberRange",
      },
    ];
  }, [t, localeCode]);

  const defaultVisibilityState = useMemo<VisibilityState | undefined>(() => {
    if (isSmUp) {
      return undefined;
    }
    return {
      description: false,
      updatedAt: false,
    };
  }, [isSmUp]);

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
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        onClose={() => setProduct(undefined)}
        open={open}
      >
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent>
          <FormControlLabel
            label="Full Width"
            control={
              <Checkbox
                value={fullWidth}
                onChange={(_, checked) => setFullWidth(checked)}
              />
            }
          />
          <FormControlLabel
            label="Full Screen"
            control={
              <Checkbox
                value={fullScreen}
                onChange={(_, checked) => setFullScreen(checked)}
              />
            }
          />
          <Box pt={2}>
            <ProductForm
              defaultValues={product ? product : undefined}
              onSubmit={(values) => {
                product
                  ? updatePropertyMutation.mutate({ id: product.id, ...values })
                  : createPropertyMutation.mutate(values);
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      <DataTable
        data={data}
        columns={columns}
        rowActions={rowActions}
        defaultVisibilityState={defaultVisibilityState}
        exportToCSV
        exportToPDF
        onCreate={() => setProduct(null)}
        onRefresh={() => getAllProductQuery.refetch()}
      />
    </>
  );
}
