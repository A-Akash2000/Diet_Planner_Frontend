import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../redux/userslice';
import type { RootState, AppDispatch } from '../../redux/store';
import { deleteCookie } from '../../utils/commonfunc/cookie';

import {
  UserGroupIcon,
  PowerIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const isAdmin = user.role === 'Admin';

  const handleLogout = (): void => {
    deleteCookie('userId');
    deleteCookie('token');
    deleteCookie('role');
    dispatch(clearUser());
    navigate('/');
  };

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-md transition ${location.pathname === path
      ? 'bg-indigo-100 text-indigo-700 font-semibold'
      : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 border-b text-xl font-bold text-indigo-700">
          Diet Planner
        </div>
        <nav className="flex flex-col p-4 space-y-2 text-sm">
          <Link to="/userlist" onClick={onClose} className={linkClass('/userlist')}>
            <Cog6ToothIcon className="w-5 h-5" />
            {user.role === 'Admin' ? 'Admin Settings' : 'User Settings'}
          </Link>
          <Link to="/MealsManager" onClick={onClose} className={linkClass('/MealsManager')}>
            <Cog6ToothIcon className="w-5 h-5" />
            Diet Menu
          </Link>
             <Link to="/Dietplans" onClick={onClose} className={linkClass('/Dietplans')}>
            <Cog6ToothIcon className="w-5 h-5" />
            Diet Plans
          </Link>
             <Link to="/Bmilogs" onClick={onClose} className={linkClass('/Bmilogs')}>
            <Cog6ToothIcon className="w-5 h-5" />
           BMI-History
          </Link>
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer rounded-md transition"
          >
            <PowerIcon className="w-5 h-5" />
            Logout
          </div>
        </nav>
      </div>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black opacity-30 z-40" />
      )}
    </>
  );
};

export default Sidebar;
