import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TextField, Button, Box, useMediaQuery, useTheme, TableSortLabel, Stack
} from '@mui/material';
import { useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { exportToExcel, exportToPDF } from '../utils/commonfunc/download';

interface CommonTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  total: number;
  isLoading: boolean;
  exportFileName: string;
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (id: string, desc: boolean) => void;
  searchable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  searchLabel:string;
}

export function CommonTable<T extends object>({
  columns,
  data,
  total,
  exportFileName,
  page,
  limit,
  search,
  sortBy,
  order,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onSortChange,
  searchable = true,
  sortable = true,
  paginated = true,
  searchLabel=""
}: CommonTableProps<T>) {
  const pageIndex = page - 1;
  const pageSize = limit;
  const sorting: SortingState = sortBy ? [{ id: sortBy, desc: order === 'desc' }] : [];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const table = useReactTable({
    data: data || [],
    columns,
    pageCount: Math.ceil((total || 0) / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onPaginationChange: updater => {
      const newState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      onPageChange(newState.pageIndex + 1);
      onLimitChange(newState.pageSize);
    },
    onSortingChange: updater => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      const sort = newSorting[0];
      if (sort) {
        onSortChange(sort.id, sort.desc);
      }
    },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const csvData = useMemo(() => data as object[], [data]);

  const headers = table.getHeaderGroups()[0]?.headers.map(h =>
    typeof h.column.columnDef.header === 'string' ? h.column.columnDef.header : ''
  ) ?? [];

  const rows = table.getRowModel().rows.map(row =>
    row.getVisibleCells().map(cell => cell.getValue() as string | number | boolean | null)
  );

  return (
    <Box>
      {searchable && (
        <TextField
          label={searchLabel||'Search'}
          variant="outlined"
          size="small"
          fullWidth
          margin="normal"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      )}

      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} mb={2}>
        <Button variant="contained" onClick={() => exportToExcel(data, exportFileName)}>Export Excel</Button>
        <Button variant="contained" onClick={() => exportToPDF(headers, rows, exportFileName)}>Export PDF</Button>
        <CSVLink data={csvData} filename={`${exportFileName}.csv`} style={{ textDecoration: 'none' }}>
          <Button variant="contained">Export CSV</Button>
        </CSVLink>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : (
                      sortable ? (
                        <TableSortLabel
                          active={header.column.getIsSorted() !== false}
                          direction={header.column.getIsSorted() === 'desc' ? 'desc' : 'asc'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {paginated && (
        <TablePagination
          component="div"
          count={total}
          page={pageIndex}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={limit}
          onRowsPerPageChange={e => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
        />
      )}
    </Box>
  );
}
