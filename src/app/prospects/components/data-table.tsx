"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ColumnDef<T> {
  accessorKey: keyof T | "actions" | string;
  header: string;
  cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

const PAGE_SIZE = 10;

export function DataTable<T extends { id: string }>({ columns, data }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(0);

  const pageCount = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = data.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < pageCount - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  React.useEffect(() => {
    // Reset to first page if filters change the data
    setCurrentPage(0);
  }, [data]);

  return (
    <Card>
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessorKey)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={String(column.accessorKey)}>
                      {column.cell
                        ? column.cell({ row: { original: row } })
                        : String(row[column.accessorKey as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-end space-x-2 p-4">
            <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {pageCount}
            </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
}
