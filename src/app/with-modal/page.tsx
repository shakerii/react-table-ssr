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
import { useState } from "react";
import { DataTable } from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { api } from "~/trpc/react";
import { columns } from "~/utils/columns";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const getAllProductQuery = api.product.getAll.useQuery(undefined, {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const createPropertyMutation = api.product.create.useMutation({
    onSuccess: async () => {
      setOpen(false);
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
    <Container sx={{ my: 4 }}>
      <Dialog
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        onClose={() => setOpen(false)}
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
              onSubmit={(values) => createPropertyMutation.mutate(values)}
            />
          </Box>
        </DialogContent>
      </Dialog>
      <DataTable
        columns={columns}
        data={data}
        GlobalActions={
          <Button onClick={() => setOpen(true)}>Create New</Button>
        }
      />
    </Container>
  );
}
