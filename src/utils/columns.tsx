import type { Product } from "@prisma/client";
import type { Columns } from "~/components/DataTable";

export const columns: Columns<Product> = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
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
    header: "Description",
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
    header: "Created At",
    cell: ({ cell }) => cell.getValue<Date | undefined>()?.toDateString(),
    aggregatedCell: undefined,
    filterFn: "auto",
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ cell }) => cell.getValue<Date | undefined>()?.toDateString(),
    aggregatedCell: undefined,
    filterFn: "auto",
  },
];
