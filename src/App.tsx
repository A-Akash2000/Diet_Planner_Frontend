import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './routes/ProtectedRoute';
import Loader from './component/Loader/Loader';
const Signup = lazy(() => import('./pages/signup'));
const Login = lazy(() => import('./pages/login'));
const Home = lazy(() => import('./pages/home'));
const Userlist = lazy(() => import('./pages/userlist'));
const MenuManger = lazy(() => import('./pages/mealmanger'));
const Dietplans = lazy(()=> import('./pages/DietPlans'))
const Bmilogs = lazy(()=> import('./pages/bmilog'))
function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/userlist" element={<ProtectedRoute><Userlist /></ProtectedRoute>} />
        <Route path="/MealsManager" element={<ProtectedRoute><MenuManger /></ProtectedRoute>} />
        <Route path="/Dietplans" element={<ProtectedRoute><Dietplans /></ProtectedRoute>} />
        <Route path="/Bmilogs" element={<ProtectedRoute><Bmilogs /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}
export default App;
