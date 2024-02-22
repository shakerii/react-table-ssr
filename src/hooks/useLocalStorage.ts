import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

const store = <TValue>(key: string, value: TValue) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const load = <TValue>(key: string, fallback: TValue) => {
  const stringValue = localStorage.getItem(key);
  if (!stringValue) {
    store(key, fallback);
    return fallback;
  }
  try {
    return JSON.parse(stringValue) as TValue;
  } catch {
    return fallback;
  }
};

export const useLocalStorage = <TValue extends string | number | object>(
  key: string,
  initialValue: TValue,
) => {
  const [value, setValue] = useState(() => load(key, initialValue));

  const set: Dispatch<SetStateAction<TValue>> = (updater) => {
    const newValue =
      typeof updater === "function" ? (updater(value) as TValue) : updater;
    store(key, newValue);
    setValue(newValue);
  };

  const handleStorage = useCallback(
    (event: StorageEvent) => {
      if (event.key === key && event.newValue !== value) {
        setValue((event.newValue as TValue) ?? initialValue);
      }
    },
    [key, value, initialValue],
  );

  useEffect(() => {
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [handleStorage]);

  return [value, set] as const;
};
