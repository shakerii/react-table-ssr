"use client";

import { Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { type ReactNode, useState, useMemo } from "react";
import { type Columns, DataTable } from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { api } from "~/trpc/react";
import { v4 as uuid } from "uuid";
import CloseIcon from "@mui/icons-material/Close";
import { DataTableSkeleton } from "~/components/skeleton/DataTableSkeleton";
import type { Product } from "@prisma/client";
import { useTranslations } from "next-intl";

type TabContext = {
  key: string;
  label: string;
  content: ReactNode;
};

export default function Home() {
  const t = useTranslations();
  const getAllProductQuery = api.product.getAll.useQuery(undefined, {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const createPropertyMutation = api.product.create.useMutation({
    onSuccess: async () => {
      await getAllProductQuery.refetch();
    },
  });

  const updatePropertyMutation = api.product.update.useMutation({
    onSuccess: async () => {
      await getAllProductQuery.refetch();
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
  }, []);

  const [selectedTab, setSelectedTab] = useState(-1);
  const [tabs, setTabs] = useState<TabContext[]>([]);

  const openTab = (tab: TabContext) => {
    setTabs((tabs) => [...tabs, tab]);
    setSelectedTab(tabs.length);
    return tabs.length;
  };

  const closeTab = (index: number) => {
    if (index < 0) {
      return;
    }
    setTabs((tabs) => {
      setSelectedTab(-1);
      const newTabs = [...tabs];
      newTabs.splice(index, 1);
      return newTabs;
    });
  };

  if (getAllProductQuery.status === "loading") {
    return <DataTableSkeleton />;
  }

  if (getAllProductQuery.status === "error") {
    return "Error";
  }

  const { data } = getAllProductQuery;

  const handleCreate = () => {
    const tabIndex = openTab({
      key: (uuid as () => string)(),
      label: "Create New",
      content: (
        <ProductForm
          onSubmit={async (values) => {
            await createPropertyMutation.mutateAsync(values);
            closeTab(tabIndex);
          }}
        />
      ),
    });
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={selectedTab + 1}
          onChange={(_, value: number) => setSelectedTab(value - 1)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label={"Products"} />
          {tabs.map((tab, index) => (
            <Tab
              key={tab.key}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">{tab.label}</Typography>
                  <CloseIcon
                    fontSize="small"
                    color="inherit"
                    onClick={() => closeTab(index)}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ display: selectedTab === -1 ? "block" : "none" }}>
        <DataTable
          columns={columns}
          data={data}
          exportToCSV
          exportToPDF
          onCreate={handleCreate}
          RowActions={({ row }) => (
            <Box display="flex">
              <Button
                size="small"
                onClick={() => {
                  const tabIndex = openTab({
                    key: (uuid as () => string)(),
                    label: `Update ${row.original.name}`,
                    content: (
                      <ProductForm
                        defaultValues={row.original}
                        onSubmit={async (values) => {
                          await updatePropertyMutation.mutateAsync({
                            id: row.original.id,
                            ...values,
                          });
                          closeTab(tabIndex);
                        }}
                      />
                    ),
                  });
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                onClick={() => deletePropertyMutation.mutate(row.original.id)}
              >
                Delete
              </Button>
            </Box>
          )}
        />
      </Box>
      {tabs.map((tab, index) => (
        <Box
          key={tab.key}
          sx={{ display: selectedTab === index ? "block" : "none" }}
        >
          {tab.content}
        </Box>
      ))}
    </>
  );
}
