import { Link } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import MenuIcon from "../../assets/MenuIcon";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 shadow-lg z-30 relative">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="focus:outline-none cursor-pointer"
            >
              <MenuIcon />
            </button>

            <Link
              to="/home"
              className="text-2xl font-extrabold tracking-wide hover:text-blue-200 transition duration-300"
            >
              Diet Management
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
