import React, { useEffect, useState, type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { getCookie } from '../utils/commonfunc/cookie';
import DashboardLayout from '../layouts/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/userslice';
import type { RootState, AppDispatch } from '../redux/store';
import { api } from '../axios/axiosinstance';
import type { UserState } from '../redux/userslice';
import Loader from '../component/Loader/Loader';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = getCookie("userId");
      const token = getCookie("token");
      console.log("userId,token",token,userId)
      if (!userId || !token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }
      try {
        const result = await api.get(`/api/user/getcurrentuser/${userId}`) as {
          data: {
            token: string;
            user: UserState;
            message: string;
          };
          success: boolean;
        };
        if (result?.data?.user) {
          dispatch(setUser(result.data.user));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (!user._id) {
      fetchUser();
    } else {
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [user._id, dispatch]);

  if (loading) return <Loader/>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;
