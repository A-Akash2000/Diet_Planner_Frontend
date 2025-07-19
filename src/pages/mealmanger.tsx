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
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Divider,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ColumnDef } from '@tanstack/react-table';
import { CommonTable } from '../component/commontable';

interface IMeal {
  _id: string;
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
  name: yup.string().required('Meal name is required'),
  category: yup.string().required('Category is required'),
  dietaryTags: yup.array().of(yup.string()).required('At least one dietary tag is required'),
  calories: yup.number().required().min(0, 'Calories must be a positive number'),
  proteins: yup.number().required().min(0, 'Proteins must be a positive number'),
  carbs: yup.number().required().min(0, 'Carbs must be a positive number'),
  fats: yup.number().required().min(0, 'Fats must be a positive number'),
  ingredients: yup.array().of(yup.string()).optional()
});

export default function MealManager() {
  const [meals, setMeals] = useState<IMeal[]>([
    {
      _id: String(Date.now() + 1),
      name: 'Vegan Salad Bowl',
      category: 'lunch',
      dietaryTags: ['vegan', 'low-carb'],
      calories: 350,
      proteins: 12,
      carbs: 25,
      fats: 10,
      ingredients: ['Lettuce', 'Tomato', 'Avocado'],
      createdAt: new Date().toISOString()
    },
    {
      _id: String(Date.now() + 2),
      name: 'Oats with Berries',
      category: 'breakfast',
      dietaryTags: ['vegetarian'],
      calories: 250,
      proteins: 8,
      carbs: 40,
      fats: 5,
      ingredients: ['Oats', 'Milk', 'Blueberries'],
      createdAt: new Date().toISOString()
    }
  ]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState<string>();
  const [order, setOrder] = useState<'asc' | 'desc'>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<IMeal | null>(null);

  const filteredMeals = meals.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const sortedMeals = sortBy
    ? [...filteredMeals].sort((a, b) =>
        order === 'desc'
          ? String(b[sortBy as keyof IMeal]).localeCompare(String(a[sortBy as keyof IMeal]))
          : String(a[sortBy as keyof IMeal]).localeCompare(String(b[sortBy as keyof IMeal]))
      )
    : filteredMeals;
  const paginatedMeals = sortedMeals.slice((page - 1) * limit, page * limit);

  const columns: ColumnDef<IMeal>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'dietaryTags',
      header: 'Tags',
      cell: ({ getValue }) => (getValue() as string[]).join(', ')
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
          color="primary"
          onClick={() => handleEdit(row.original)}
        >
          Edit
        </Button>
      )
    }
  ];

  const handleEdit = (meal: IMeal) => {
    setEditingMeal(meal);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingMeal(null);
    setModalOpen(true);
  };

  const handleSubmit = (data: IMeal) => {
    if (editingMeal) {
      setMeals(prev =>
        prev.map(m => (m._id === editingMeal._id ? { ...editingMeal, ...data } : m))
      );
    } else {
      setMeals(prev => [
        ...prev,
        {
          ...data,
          _id: String(Date.now()),
          createdAt: new Date().toISOString()
        }
      ]);
    }
    setModalOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }} color="primary">
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
          <MealForm defaultValues={editingMeal || undefined} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function MealForm({
  defaultValues,
  onSubmit
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
    formState: { errors }
  } = useForm<IMeal>({
    defaultValues,
    resolver: yupResolver(schema)
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
    setValue('dietaryTags', currentTags.filter(t => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ width: '100%' }}>
        <TextField
          label="Meal Name"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
        />
        <TextField
          select
          label="Category"
          {...register('category')}
          error={!!errors.category}
          helperText={errors.category?.message}
          fullWidth
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map(cat => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Add Dietary Tag"
          onKeyDown={handleTagAdd}
          placeholder="Press Enter to add"
          fullWidth
        />
        <Stack direction="row" spacing={1}>
          {(getValues('dietaryTags') || []).map(tag => (
            <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} />
          ))}
        </Stack>

        <TextField
          type="number"
          label="Calories"
          {...register('calories')}
          error={!!errors.calories}
          fullWidth
        />
        <TextField
          type="number"
          label="Proteins"
          {...register('proteins')}
          error={!!errors.proteins}
          fullWidth
        />
        <TextField
          type="number"
          label="Carbs"
          {...register('carbs')}
          error={!!errors.carbs}
          fullWidth
        />
        <TextField
          type="number"
          label="Fats"
          {...register('fats')}
          error={!!errors.fats}
          fullWidth
        />
        <TextField
          label="Ingredients (comma separated)"
          defaultValue={defaultValues?.ingredients?.join(', ') || ''}
          onBlur={e =>
            setValue(
              'ingredients',
              e.target.value
                .split(',')
                .map(i => i.trim())
                .filter(Boolean)
            )
          }
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Save
        </Button>
      </Stack>
    </form>
  );
}
