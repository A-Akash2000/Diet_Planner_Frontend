import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { type RootState } from '../../redux/store';
import { showErrorToast, showSuccessToast } from '../../utils/commonfunc/toast';
import { api } from '../../axios/axiosinstance';
type ModeType = 'add' | 'edit' | 'view';

type FormData = {
  name: string;
  email: string;
  contactNumber: string;
  password?: string;
  confirmPassword?: string;
  role: string;
  shift: string;
  address: string;
  gender: string;
  isAvailable: boolean;
  profilePicture?: File | null | string;
};

type UpdateFormData = Omit<FormData, 'confirmPassword'> & {
  _id: string;
  shiftStart?: string;
  shiftEnd?: string;
};

type ApiResponse = {
  status: boolean;
  message?: string;
  errors?: { msg: string; path: string }[];
};

const schema = (isProfile: boolean): yup.ObjectSchema<FormData> => {
  console.log('isProfile:', isProfile);

  return yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    contactNumber: yup.string().required('Contact number is required'),

    password: yup.string().when('$isAddMode', {
      is: true,
      then: (schema) => schema.min(6, 'Password must be at least 6 characters').required('Password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    confirmPassword: yup.string().when('password', {
      is: (password: string | undefined) => !!password,
      then: (schema) =>
        schema
          .oneOf([yup.ref('password')], 'Passwords must match')
          .required('Confirm Password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    role: yup.string().required('Role is required'),
    shift: yup.string().required('Shift is required'),
    address: yup.string().required('Address is required'),
    gender: yup.string().required('Gender is required'),
    isAvailable: yup.boolean().required('Availability is required'),

    profilePicture: yup
      .mixed<File>()
      .nullable()
      .test('fileType', 'Only PNG, JPEG, JPG, or WEBP files are allowed', (value) => {
        if (!value || typeof value === 'string') return true;
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        return allowedTypes.includes(value.type);
      }),
  });
};


const updateUser = async (data: UpdateFormData): Promise<ApiResponse> => {
  const [shiftStart, shiftEnd] = data.shift?.split(' - ') ?? ['', ''];
  const formData = new FormData();

  if (data._id !== undefined) formData.append('id', data._id);
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.email !== undefined) formData.append('email', data.email);
  if (data.contactNumber !== undefined) formData.append('contactNumber', data.contactNumber);
  if (data.password !== undefined) formData.append('password', data.password);
  if (data.role !== undefined) formData.append('role', data.role);
  if (shiftStart !== undefined) formData.append('shiftStart', shiftStart);
  if (shiftEnd !== undefined) formData.append('shiftEnd', shiftEnd);
  if (data.address !== undefined) formData.append('address', data.address);
  if (data.gender !== undefined) formData.append('gender', data.gender);
  if (data.isAvailable !== undefined) formData.append('isAvailable', String(data.isAvailable));


  if (data.profilePicture instanceof File) {
    formData.append('profilePicture', data.profilePicture);
  } else if (typeof data.profilePicture === 'string') {
    formData.append('profilePicture', data.profilePicture);
  }

  const response = await api.post<ApiResponse>('/api/user/update-user', formData);
  if (!response.data) throw new Error('No response data received from server');
  return response.data;
};

const createUser = async (data: Omit<FormData, 'confirmPassword'>): Promise<ApiResponse> => {
  const [shiftStart, shiftEnd] = data.shift.split(' - ');
  const formData = new FormData();

  if (data.name !== undefined) formData.append('name', data.name);
  if (data.email !== undefined) formData.append('email', data.email);
  if (data.contactNumber !== undefined) formData.append('contactNumber', data.contactNumber);
  if (data.password !== undefined) formData.append('password', data.password);
  if (data.role !== undefined) formData.append('role', data.role);
  if (shiftStart !== undefined) formData.append('shiftStart', shiftStart);
  if (shiftEnd !== undefined) formData.append('shiftEnd', shiftEnd);
  if (data.address !== undefined) formData.append('address', data.address);
  if (data.gender !== undefined) formData.append('gender', data.gender);
  if (data.isAvailable !== undefined) formData.append('isAvailable', String(data.isAvailable));

  if (data.profilePicture instanceof File) {
    formData.append('profilePicture', data.profilePicture);
  } else if (typeof data.profilePicture === 'string') {
    formData.append('profilePicture', data.profilePicture);
  }

  const response = await api.post<ApiResponse>('/api/user/add-user', formData);
  if (!response.data) throw new Error('No response data received from server');

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
  const reduxUser = useSelector((state: RootState) => state.user);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  console.log("mode === 'add'", mode === 'add')
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema(mode == 'add' ? true : false)),
    context: { isAddMode: mode === 'add' },
  });

  useEffect(() => {
    if (user && mode !== 'add') {
      reset({
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        password: '',
        confirmPassword: '',
        role: user.role,
        shift: `${user.shiftStart ?? ''} - ${user.shiftEnd ?? ''}`,
        address: user.address,
        gender: user.gender,
        isAvailable: user.isAvailable,
        profilePicture: null,
      });
      setProfilePicturePreview(typeof user.profilePicture === 'string' ? user.profilePicture : null);
    } else {
      reset({
        name: '',
        email: '',
        contactNumber: '',
        password: '',
        confirmPassword: '',
        role: '',
        shift: '',
        address: '',
        gender: '',
        isAvailable: false,
        profilePicture: null,
      });
      setProfilePicturePreview(null);
    }
  }, [user, mode, reset]);

  const mutation = useMutation<ApiResponse, Error, FormData>({
    mutationFn: (data) => {
      const { confirmPassword, ...formData } = data;
      return mode === 'add'
        ? createUser(formData)
        : updateUser({ ...formData, _id: user?._id ?? reduxUser._id });
    },
    onSuccess: (data) => {
      if (data.status) {
        showSuccessToast(mode === 'add' ? 'User created!' : 'Update successful!');
        reset();
        setProfilePicturePreview(null);
        onClose();
      } else if (data.errors?.length) {
        data.errors.forEach((err) => {
          setError(err.path as keyof FormData, {
            type: 'server',
            message: err.msg,
          });
          showErrorToast(`${err.path}: ${err.msg}`);
        });
      } else {
        showErrorToast(data.message || 'Operation failed');
      }
    },
    onError: (error) => {
      showErrorToast(error.message || 'Something went wrong');
    },
  });

  const onSubmit = (data: FormData) => {
    if (mode !== 'view') {
      mutation.mutate(data);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('profilePicture', file);
    } else {
      setProfilePicturePreview(null);
      setValue('profilePicture', null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl">
          ×
        </button>
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          {mode === 'view' ? 'View Profile' : mode === 'edit' ? 'Update Profile' : 'Register User'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Input fields */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">name:</label>
            <input
              type="text"
              id="name"
              {...register('name')}
              disabled={mode === 'view'}
              className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              disabled={mode === 'view'}
              className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          {/* <div className="space-y-2">
            <label htmlFor="contactNumber" className="text-sm font-medium text-gray-700">Contact Number:</label>
            <input
              type="text"
              id="contactNumber"
              {...register('contactNumber')}
              disabled={mode === 'view'}
              className={`w-full p-2 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
            {errors.contactNumber && <p className="text-red-500 text-xs">{errors.contactNumber.message}</p>}
          </div> */}
          {mode !== 'view' && (
            <>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password:</label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className={`w-full p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}
          {mode !== 'view' && (
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {mode === 'edit' ? 'Update Profile' : 'Register User'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterFormModal;