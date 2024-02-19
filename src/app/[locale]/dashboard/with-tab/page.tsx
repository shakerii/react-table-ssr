"use client";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { Product } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { type ReactElement, useMemo } from "react";

import {
  type Columns,
  DataTable,
  type RowAction,
  type VisibilityState,
} from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { DataTableSkeleton } from "~/components/skeleton/DataTableSkeleton";
import { useTabs } from "~/hooks/useTabs";
import { api } from "~/trpc/react";
import { localeCodes } from "~/utils/navigation";

type TKey = "products" | "new" | number;

type Tab = {
  key: TKey;
  label: string;
  content: ReactElement | undefined;
};

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const localeCode =
    locale in localeCodes
      ? localeCodes[locale as keyof typeof localeCodes]
      : "en-US";
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const { tabs, currentTabIndex, setCurrentTabIndex, openTab, closeTab } =
    useTabs<TKey, Tab>({
      defaultTabs: [
        {
          key: "products",
          label: t("with-tab.products"),
          content: undefined,
        },
      ],
    });

  const getAllProductQuery = api.product.getAll.useQuery(undefined, {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const createPropertyMutation = api.product.create.useMutation({
    onSuccess: async () => {
      await getAllProductQuery.refetch();
      closeTab("new");
    },
  });

  const updatePropertyMutation = api.product.update.useMutation({
    onSuccess: async (product) => {
      await getAllProductQuery.refetch();
      closeTab(product.id);
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
        accessorFn: (row) => row.createdAt.toLocaleDateString(localeCode),
        header: t("data.columns.created-at"),
        aggregatedCell: () => undefined,
        enableColumnFilter: false,
        filterFn: "inNumberRange",
      },
      {
        id: "updatedAt",
        accessorFn: (row) => row.updatedAt.toLocaleDateString(localeCode),
        header: t("data.columns.updated-at"),
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
        onClick: (row) => {
          openTab({
            key: row.original.id,
            label: t("with-tab.update-product", row.original),
            content: (
              <ProductForm
                defaultValues={row.original}
                onSubmit={async (values) => {
                  await updatePropertyMutation.mutateAsync({
                    id: row.original.id,
                    ...values,
                  });
                }}
              />
            ),
          });
        },
      },
      {
        name: t("data.actions.delete"),
        icon: <DeleteIcon />,
        onClick: (row) => deletePropertyMutation.mutate(row.original.id),
      },
    ];
  }, [t, openTab, deletePropertyMutation, updatePropertyMutation]);

  if (getAllProductQuery.status === "loading") {
    return <DataTableSkeleton />;
  }

  if (getAllProductQuery.status === "error") {
    return "Error";
  }

  const { data } = getAllProductQuery;

  const handleCreate = () => {
    openTab({
      key: "new",
      label: t("with-tab.create"),
      content: (
        <ProductForm
          onSubmit={async (values) => {
            await createPropertyMutation.mutateAsync(values);
          }}
        />
      ),
    });
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={currentTabIndex}
          onChange={(_, value: number) => setCurrentTabIndex(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">{tab.label}</Typography>
                  {!!tab.content && (
                    <CloseIcon
                      fontSize="small"
                      color="inherit"
                      onClick={() => closeTab(tab.key)}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      {tabs.map((tab, index) => (
        <Box
          key={tab.key}
          sx={{ display: currentTabIndex === index ? "block" : "none" }}
        >
          {tab.content ? (
            tab.content
          ) : (
            <DataTable
              data={data}
              columns={columns}
              rowActions={rowActions}
              defaultVisibilityState={defaultVisibilityState}
              exportToCSV
              exportToPDF
              onCreate={handleCreate}
              onRefresh={() => getAllProductQuery.refetch()}
            />
          )}
        </Box>
      ))}
    </>
  );
}
