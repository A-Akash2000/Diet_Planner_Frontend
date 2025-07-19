import React, { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CommonTable } from '../component/commontable';
import { api } from '../axios/axiosinstance';
import { CircularProgress, Paper, Typography } from '@mui/material';
import { getCookie } from '../utils/commonfunc/cookie';

interface IBmiLog {
  _id: string;
  weight: number;
  height: number;
  bmi: number;
  note?: string;
  createdAt: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: IBmiLog[];
  total: number;
}



const BmiLogPage: React.FC= () => {
  const [data, setData] = useState<IBmiLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [order, setOrder] = useState<'asc' | 'desc' | undefined>();
  const [loading, setLoading] = useState(false);
  const _id = getCookie("userId")
  const fetchBmiLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse>(`/api/user/bmi-logs/${_id}`, {
        params: {
          page,
          limit,
          search,
          sortBy,
          order,
        },
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch BMI logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (_id) {
      fetchBmiLogs();
    }
  }, [_id, page, limit, search, sortBy, order]);

  const columns = useMemo<ColumnDef<IBmiLog>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: info => new Date(info.getValue<string>()).toLocaleDateString(),
      },
      {
        accessorKey: 'weight',
        header: 'Weight (kg)',
      },
      {
        accessorKey: 'height',
        header: 'Height (cm)',
      },
      {
        accessorKey: 'bmi',
        header: 'BMI',
        cell: info => parseFloat(info.getValue<number>().toFixed(2)),
      },
    //   {
    //     accessorKey: 'note',
    //     header: 'Note',
    //     cell: info => info.getValue() || '-',
    //   },
    ],
    []
  );

  return (
    <Paper className="p-4">
      <Typography variant="h6" gutterBottom>
        BMI Log History
      </Typography>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <CommonTable
          columns={columns}
          data={data}
          total={total}
          isLoading={loading}
          exportFileName="bmi_logs"
          page={page}
          limit={limit}
          search={search}
          sortBy={sortBy}
          order={order}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onSearchChange={setSearch}
          onSortChange={(id, desc) => {
            setSortBy(id);
            setOrder(desc ? 'desc' : 'asc');
          }}
          searchLabel="Search weight - height"
        />
      )}
    </Paper>
  );
};

export default BmiLogPage;
