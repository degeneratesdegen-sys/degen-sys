'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { useBudget } from '@/contexts/budget-context';
import type { Transaction } from '@/lib/types';
import { TransactionReceiptDialog } from './transaction-receipt-dialog';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const { getCategoryByName } = useBudget();
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<TData | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
        pagination: {
            pageSize: 50,
        }
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleExport = () => {
    const rowsToExport = table.getFilteredRowModel().rows;
    if (!rowsToExport.length) {
      return;
    }

    const headers = ['Date', 'Description', 'Category/Contact', 'Amount', 'Type'];

    const escapeCsvCell = (cell: any) => {
      let cellString = String(cell ?? '');
      if (cellString.includes('"') || cellString.includes(',') || cellString.includes('\n')) {
        cellString = '"' + cellString.replace(/"/g, '""') + '"';
      }
      return cellString;
    };

    const csvRows = rowsToExport.map((row) => {
      const original = row.original as Transaction;
      
      const isEtransfer = original.type === 'e-transfer-send' || original.type === 'e-transfer-receive';
      const detail = isEtransfer 
        ? original.contact
        : (getCategoryByName(original.category || '')?.name || original.category);

      return [
        format(new Date(original.date), 'yyyy-MM-dd'),
        original.description,
        detail,
        original.amount,
        original.type,
      ]
        .map(escapeCsvCell)
        .join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter by description..."
          value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('description')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={(e) => {
                    // Prevent dialog from opening when clicking on the action menu in the last cell
                    const targetNode = e.target as Node;
                    if (targetNode.nodeName === 'TD' && (targetNode.parentElement as HTMLTableRowElement)?.lastElementChild === targetNode) {
                        return;
                    }
                     if ((e.target as HTMLElement).closest('[data-radix-collection-item]')) {
                        return;
                    }
                    setSelectedTransaction(row.original);
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <TransactionReceiptDialog
        transaction={selectedTransaction as Transaction | null}
        open={!!selectedTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransaction(null);
          }
        }}
      />
    </div>
  );
}
