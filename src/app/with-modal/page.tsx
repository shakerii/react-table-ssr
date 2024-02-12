"use client";

import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import type { Product } from "@prisma/client";
import { useState } from "react";
import { Breadcrumbs } from "~/components/Breadcrumbs";
import { DataTable } from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { api } from "~/trpc/react";
import { columns } from "~/utils/columns";

export default function Home() {
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

  if (getAllProductQuery.status === "loading") {
    return "Loading";
  }

  if (getAllProductQuery.status === "error") {
    return "Error";
  }

  const { data } = getAllProductQuery;

  return (
    <Container className="my-4">
      <Breadcrumbs
        links={[{ title: "Home", href: "/" }]}
        current="With Modal"
      />
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
        GlobalActions={
          <Button onClick={() => setProduct(null)}>Create New</Button>
        }
        RowActions={({ row }) => (
          <Box display="flex">
            <Button onClick={() => setProduct(row.original)}>Edit</Button>
            <Button
              onClick={() => deletePropertyMutation.mutate(row.original.id)}
            >
              Delete
            </Button>
          </Box>
        )}
      />
    </Container>
  );
}
