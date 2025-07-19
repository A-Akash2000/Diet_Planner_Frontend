import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../axios/axiosinstance';
import { showErrorToast, showSuccessToast } from '../../utils/commonfunc/toast';
import { getCookie } from '../../utils/commonfunc/cookie';

type ModeType = 'add' | 'edit';

type FormData = {
  email: string;
  password?: string;
  confirmPassword?: string;
  role?: string; // always 'User'
};

type UpdateFormData = Omit<FormData, 'confirmPassword'> & {
  _id: string;
};

const schema = (isAddMode: boolean): yup.ObjectSchema<FormData> =>
  yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),

    password: yup.string().when('$isAddMode', {
      is: true,
      then: (schema) =>
        schema.min(6, 'Password must be at least 6 characters').required('Password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    confirmPassword: yup.string().when('password', {
      is: (val: string | undefined) => !!val,
      then: (schema) =>
        schema.oneOf([yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    role: yup.string().default('User'),
  });

const createUser = async (data: FormData) => {
  const payload = { ...data, role: 'User' };
  const response = await api.post('/api/user/add-user', payload);
  return response.data;
};

const updateUser = async (data: UpdateFormData) => {
  const payload = { ...data, role: 'User', id: getCookie("userId") };
  const response = await api.post('/api/user/update-user', payload);
  return response.data;
};

const RegisterFormModal = ({
  isOpen,
  onClose,
  user,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  user?: UpdateFormData;
  mode: ModeType;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema(mode === 'add')),
    context: { isAddMode: mode === 'add' },
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      reset({
        email: user.email,
        password: '',
        confirmPassword: '',
        role: 'User',
      });
    } else {
      reset({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User',
      });
    }
  }, [user, mode, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (mode === 'add') return createUser(data);
      return updateUser({ ...data, _id: user?._id! });
    },
    onSuccess: (res) => {
      if (res.status) {
        showSuccessToast(mode === 'add' ? 'User created!' : 'User updated!');
        onClose();
      } else if (res.errors) {
        res.errors.forEach((err: any) =>
          setError(err.path as keyof FormData, { type: 'server', message: err.msg })
        );
      } else {
        showErrorToast(res.message || 'Something went wrong');
      }
    },
    onError: () => showErrorToast('Server error'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-indigo-700 text-center mb-6">
          {mode === 'add' ? 'Register User' : 'Update User'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              disabled={mode === 'edit'}
              className={`mt-2 w-full border rounded-md px-4 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`mt-2 w-full border rounded-md px-4 py-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={`mt-2 w-full border rounded-md px-4 py-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <input type="hidden" {...register('role')} value="User" />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none transition"
          >
            {mode === 'add' ? 'Register' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterFormModal;
