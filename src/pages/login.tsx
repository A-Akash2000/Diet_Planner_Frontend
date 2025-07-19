import '../App.css';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../axios/axiosinstance';
import { setCookie } from '../utils/commonfunc/cookie';
import { showErrorToast, showSuccessToast } from '../utils/commonfunc/toast';
import { useAppDispatch } from '../redux/hooks';
import { setUser } from '../redux/userslice';
import { Link } from 'react-router-dom';

type LoginFormData = {
  email: string;
  password: string;
};

interface AuthResponse {
  token: string;
  user: any;
  message: string;
}

interface APIError {
  message?: string;
  errors?: Record<string, string>[];
  status?: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      const result = await api.post<AuthResponse>('/api/user/login', data) as {
        success: boolean;
        data?: AuthResponse;
        error?: APIError | string;
      };

      if (result.success && result.data) {
        const { token, user, message } = result.data;

        if (!token || !user) {
          showErrorToast("Invalid response from server.");
          return;
        }

        showSuccessToast(message || "Login successful!");
        setCookie('token', token, 7);
        setCookie('userId', user._id, 7);
        setCookie('role', user.role, 7);
        dispatch(setUser(user));
        navigate('/home');
      } else {
        const errorMessage = result.data?.message || "Login failed. Please try again.";
        showErrorToast(errorMessage);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      showErrorToast("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-indigo-700">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Login to your hospital dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Login
          </button>
          <p className="text-sm text-center mt-4 text-gray-600">
            If you don’t have an account,&nbsp;
            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
              click Signup
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
