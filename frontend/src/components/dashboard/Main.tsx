import { Outlet } from 'react-router-dom'; // This will render the child routes
import {Sidebar} from '../../components/dashboard/Sidebar';
import {Navbar} from '../../components/dashboard/Navbar';
import { useTheme } from '../../hooks/useTheme';

export const DashBoardLayout = () => {
  const {isActiveMenu} = useTheme()


  return (
    <div className="flex z-1000">
      <div
        className={`fixed h-screen bg-gray-800 text-white z-30 transition-all duration-300 
        ${isActiveMenu ? 'w-64' : 'w-0'}`} 
      >
        <Sidebar />
      </div>

      <div className={`flex-1 bg-gray-100 min-h-screen transition-all duration-300 
        ${isActiveMenu ? 'ml-64' : 'ml-0'} overflow-hidden`}>
        
        <div className="w-full z-50">
          <Navbar />
        </div>

        <div className="p-4 mt-16 overflow-y-auto h-[calc(100vh-64px)]"> 
          <Outlet />
        </div>

        
      </div>
    </div>
  );
};

