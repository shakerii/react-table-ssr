"use client";

import { Box, Button, Container, IconButton, Tab, Tabs } from "@mui/material";
import { type ReactNode, useState } from "react";
import { DataTable } from "~/components/DataTable";
import { ProductForm } from "~/components/forms/ProductForm";
import { api } from "~/trpc/react";
import { columns } from "~/utils/columns";
import { v4 as uuid } from "uuid";
import CloseIcon from "@mui/icons-material/Close";

type TabContext = {
  key: string;
  label: string;
  content: ReactNode;
};

export default function Home() {
  const getAllProductQuery = api.product.getAll.useQuery(undefined, {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const createPropertyMutation = api.product.create.useMutation({
    onSuccess: async () => {
      await getAllProductQuery.refetch();
    },
  });

  const [selectedTab, setSelectedTab] = useState(-1);
  const [tabs, setTabs] = useState<TabContext[]>([]);

  const openTab = (tab: TabContext) => {
    setTabs((tabs) => [...tabs, tab]);
    setSelectedTab(tabs.length);
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
    return "Loading";
  }

  if (getAllProductQuery.status === "error") {
    return "Error";
  }

  const { data } = getAllProductQuery;

  return (
    <Container sx={{ my: 4 }}>
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
                <Box>
                  {tab.label}
                  <IconButton
                    sx={{ p: 0, ml: 1 }}
                    color="inherit"
                    onClick={() => closeTab(index)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
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
          GlobalActions={
            <Button
              onClick={() =>
                openTab({
                  key: (uuid as () => string)(),
                  label: "Create New - " + Math.floor(Math.random() * 100),
                  content: (
                    <ProductForm
                      onSubmit={(values) =>
                        createPropertyMutation.mutate(values)
                      }
                    />
                  ),
                })
              }
            >
              Create New
            </Button>
          }
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
    </Container>
  );
}
