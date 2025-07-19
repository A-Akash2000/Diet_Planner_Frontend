import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  TextField,
  Stack,
  Chip,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ColumnDef } from '@tanstack/react-table';
import { CommonTable } from '../component/commontable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../axios/axiosinstance';

interface IMeal {
  _id?: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryTags: string[];
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  ingredients?: string[];
  createdAt?: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  category: yup.string().required('Category is required'),
  dietaryTags: yup.array().of(yup.string()).min(1, 'Add at least one tag'),
  calories: yup.number().required().min(0),
  proteins: yup.number().required().min(0),
  carbs: yup.number().required().min(0),
  fats: yup.number().required().min(0),
  ingredients: yup.array().of(yup.string().trim()).optional(),
});

export default function MealManager() {
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState<string>();
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<IMeal | null>(null);

  const fetchMeals = async () => {
    try {
      const res = await api.get('/api/user/getmeal');
      setMeals(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch meals.');
    }
  };

  const saveMeal = async (data: IMeal) => {
    try {
      let response;
      if (editingMeal && editingMeal._id) {
        response = await api.post(`/api/user/update-meal/${editingMeal._id}`, data);
        setMeals((prev) =>
          prev.map((m) => (m._id === editingMeal._id ? response.data.data : m))
        );
        toast.success('Meal updated successfully.');
      } else {
        response = await api.post('/api/user/add-meals', data);
        console.log("responseresponse",response)
        setMeals((prev) => [...prev, response.data.data]);
        toast.success('Meal added successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save meal.');
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedMeals = sortBy
    ? [...filteredMeals].sort((a, b) =>
        order === 'desc'
          ? String(b[sortBy as keyof IMeal]).localeCompare(
              String(a[sortBy as keyof IMeal])
            )
          : String(a[sortBy as keyof IMeal]).localeCompare(
              String(b[sortBy as keyof IMeal])
            )
      )
    : filteredMeals;

  const paginatedMeals = sortedMeals.slice((page - 1) * limit, page * limit);

  const columns: ColumnDef<IMeal>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'dietaryTags',
      header: 'Tags',
      cell: ({ getValue }) => (getValue() as string[]).join(', '),
    },
    { accessorKey: 'calories', header: 'Calories' },
    { accessorKey: 'proteins', header: 'Proteins' },
    { accessorKey: 'carbs', header: 'Carbs' },
    { accessorKey: 'fats', header: 'Fats' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleEdit(row.original)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleEdit = (meal: IMeal) => {
    setEditingMeal(meal);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingMeal(null);
    setModalOpen(true);
  };

  return (
    <>
      <ToastContainer />
      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Add Meal
      </Button>

      <CommonTable
        columns={columns}
        data={paginatedMeals}
        total={filteredMeals.length}
        exportFileName="meals"
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
        searchLabel="Search meals..."
      />

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMeal ? 'Edit Meal' : 'Add Meal'}</DialogTitle>
        <DialogContent>
          <MealForm defaultValues={editingMeal || undefined} onSubmit={saveMeal} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function MealForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: IMeal;
  onSubmit: (data: IMeal) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<IMeal>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues || {
      name: '',
      category: 'breakfast',
      dietaryTags: [],
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
      ingredients: [],
    },
  });

  useEffect(() => {
    reset(defaultValues || {});
  }, [defaultValues]);

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value.trim();
    if (e.key === 'Enter' && value) {
      e.preventDefault();
      const currentTags = getValues('dietaryTags') || [];
      if (!currentTags.includes(value)) {
        setValue('dietaryTags', [...currentTags, value]);
      }
      input.value = '';
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = getValues('dietaryTags') || [];
    setValue('dietaryTags', currentTags.filter((t) => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} mt={2}>
        <TextField
          label="Name"
          fullWidth
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          select
          label="Category"
          fullWidth
          {...register('category')}
          error={!!errors.category}
          helperText={errors.category?.message}
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Add Dietary Tag"
          onKeyDown={handleTagAdd}
          placeholder="Press Enter to add"
        />
        <Stack direction="row" spacing={1}>
          {(getValues('dietaryTags') || []).map((tag) => (
            <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} />
          ))}
        </Stack>

        <TextField
          type="number"
          label="Calories"
          fullWidth
          {...register('calories')}
          error={!!errors.calories}
          helperText={errors.calories?.message}
        />
        <TextField
          type="number"
          label="Proteins"
          fullWidth
          {...register('proteins')}
          error={!!errors.proteins}
          helperText={errors.proteins?.message}
        />
        <TextField
          type="number"
          label="Carbs"
          fullWidth
          {...register('carbs')}
          error={!!errors.carbs}
          helperText={errors.carbs?.message}
        />
        <TextField
          type="number"
          label="Fats"
          fullWidth
          {...register('fats')}
          error={!!errors.fats}
          helperText={errors.fats?.message}
        />
        <TextField
          label="Ingredients (comma separated)"
          fullWidth
          defaultValue={defaultValues?.ingredients?.join(', ') || ''}
          onBlur={(e) =>
            setValue(
              'ingredients',
              e.target.value
                .split(',')
                .map((i) => i.trim())
                .filter(Boolean)
            )
          }
        />
        <Button type="submit" variant="contained">
          Save
        </Button>
      </Stack>
    </form>
  );
}
