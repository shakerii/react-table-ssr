import { Paper, Skeleton } from "@mui/material";

export const DataTableSkeleton = () => {
  return (
    <Paper className="space-y-4 px-4 py-3">
      <Skeleton variant="rounded" width={200} />
      <Skeleton variant="rounded" width="100%" height={40} />
      {new Array(20).fill(null).map((_, index) => {
        return (
          <Skeleton key={index} variant="rounded" width="100%" height={30} />
        );
      })}
    </Paper>
  );
};
