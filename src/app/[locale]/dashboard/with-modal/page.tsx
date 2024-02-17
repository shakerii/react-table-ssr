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
} from "@mui/material";
import type { Product } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { type Columns, DataTable } from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { DataTableSkeleton } from "~/components/skeleton/DataTableSkeleton";
import { api } from "~/trpc/react";

export default function Home() {
  const t = useTranslations();
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
        header: t("columns.name"),
        cell: ({ cell }) => (
          <span className="block max-w-72 overflow-hidden text-ellipsis whitespace-nowrap">
            {cell.getValue<string | undefined>()}
          </span>
        ),
        filterFn: "includesString",
      },
      {
        id: "description",
        accessorKey: "description",
        header: t("columns.description"),
        cell: ({ cell }) => (
          <span className="block max-w-96 overflow-hidden text-ellipsis whitespace-nowrap">
            {cell.getValue<string | undefined>()}
          </span>
        ),
        filterFn: "includesString",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: t("columns.created-at"),
        cell: ({ cell }) => cell.getValue<Date | undefined>()?.toDateString(),
        aggregatedCell: undefined,
        filterFn: "auto",
      },
      {
        id: "updatedAt",
        accessorKey: "updatedAt",
        header: t("columns.updated-at"),
        cell: ({ cell }) => cell.getValue<Date | undefined>()?.toDateString(),
        aggregatedCell: undefined,
        filterFn: "auto",
      },
    ];
  }, [t]);

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
        columns={columns}
        data={data}
        exportToCSV
        exportToPDF
        onCreate={() => setProduct(null)}
        onRefresh={() => getAllProductQuery.refetch()}
        rowActions={[
          {
            name: "Edit",
            icon: <EditIcon />,
            onClick: (row) => setProduct(row.original),
          },
          {
            name: "Delete",
            icon: <DeleteIcon />,
            onClick: (row) => deletePropertyMutation.mutate(row.original.id),
          },
        ]}
      />
    </>
  );
}
