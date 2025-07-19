import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { showErrorToast, showSuccessToast } from '../../src/utils/commonfunc/toast';
import { api } from '../../src/axios/axiosinstance';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type ApiResponse = {
  Status?: boolean;
  status?: boolean;
  message?: string;
  msg?: string;
  errors?: { msg: string; path: string }[];
};

const defaultValues: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
};

const schema: yup.ObjectSchema<FormData> = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm your password'),
});

const registerUser = async (data: FormData): Promise<ApiResponse> => {
  const newUser = {
    email: data.email,
    password: data.password,
    role: 'User',
  };

  const response = await api.post<ApiResponse>('/api/user/add-user', newUser);
  if (!response.data) throw new Error('No response data received from server');
  return response.data;
};

const mapBackendErrors = (
  errors: { msg: string; path: string }[],
  setError: ReturnType<typeof useForm<FormData>>['setError']
) => {
  errors.forEach((err) => {
    setError(err.path as keyof FormData, {
      type: 'server',
      message: err.msg,
    });
  });
};

function RegisterForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const mutation = useMutation<ApiResponse, Error, FormData>({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data?.status) {
        showSuccessToast('Registration successful!');
        reset();
        navigate('/');
      } else if (data.message === 'Internal server error') {
        showErrorToast('Something went wrong');
      } else if (data?.errors?.length) {
        mapBackendErrors(data.errors, setError);
        data.errors.forEach((err) => showErrorToast(`${err.path}: ${err.msg}`));
      } else {
        showErrorToast(data?.message || 'Registration failed');
      }
    },
    onError: (error) => {
      showErrorToast(error.message || 'Something went wrong');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-200"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-700">Register</h2>
          <p className="text-gray-500">Create your account</p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <InputField label="Email" name="email" type="email" register={register} error={errors.email?.message} />
          <InputField label="Password" name="password" type="password" register={register} error={errors.password?.message} />
          <InputField label="Confirm Password" name="confirmPassword" type="password" register={register} error={errors.confirmPassword?.message} />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
        >
          {mutation.isPending ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/" className="text-indigo-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

// Reusable Input Field
const InputField = ({
  name,
  label,
  type = 'text',
  register,
  error,
}: {
  name: keyof FormData;
  label: string;
  type?: string;
  register: any;
  error?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      {...register(name)}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default RegisterForm;
