export const pick = <TObj, TKey extends keyof TObj>(
  obj: TObj,
  ...keys: TKey[]
) => {
  return Object.fromEntries(keys.map((key) => [key, obj[key]])) as {
    [k in TKey]: TObj[TKey];
  };
};
