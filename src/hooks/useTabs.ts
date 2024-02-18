import { useCallback, useState } from "react";

import type { Comparable } from "~/utils/types";

type Props<
  TKey extends Comparable,
  Tab extends {
    key: TKey;
  },
> = {
  defaultTabs?: Tab[];
  defaultTabIndex?: number;
};

export const useTabs = <
  TKey extends Comparable,
  Tab extends {
    key: TKey;
  },
>(
  props?: Props<TKey, Tab>,
) => {
  const [tabs, setTabs] = useState<Tab[]>(props?.defaultTabs ?? []);
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(
    props?.defaultTabIndex ?? 0,
  );
  const currentTab = tabs[currentTabIndex];

  const openTab = useCallback(
    (tab: Tab) => {
      const existedTabIndex = tabs.findIndex((t) => t.key === tab.key);
      if (existedTabIndex !== -1) {
        setCurrentTabIndex(existedTabIndex);
        return;
      }
      setTabs((tabs) => [...tabs, tab]);
      setCurrentTabIndex(tabs.length);
    },
    [tabs],
  );

  const closeTab = (tabKey: TKey) => {
    const tabIndex = tabs.findIndex((tab) => tab.key === tabKey);
    if (tabIndex === -1) {
      return;
    }
    if (currentTabIndex === tabIndex) {
      setCurrentTabIndex(tabIndex > 0 ? tabIndex - 1 : 0);
    }
    setTabs((tabs) => tabs.filter((tab) => tab.key !== tabKey));
  };

  const closeTabByIndex = useCallback(
    (tabIndex: number) => {
      if (currentTabIndex === tabIndex) {
        setCurrentTabIndex(tabIndex > 0 ? tabIndex - 1 : 0);
      }
      setTabs((tabs) => {
        const newTabs = [...tabs];
        newTabs.splice(tabIndex, 1);
        return newTabs;
      });
    },
    [currentTabIndex],
  );

  return {
    tabs,
    currentTab,
    currentTabIndex,
    setCurrentTabIndex,
    openTab,
    closeTab,
    closeTabByIndex,
  };
};
