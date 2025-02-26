import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiChevronDown, FiChevronUp, FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { setActiveMenu } from '../../redux/slices/themeSlice';
import { userLinks } from '../../utils/sidebarLinks';
import { useTheme } from '../../hooks/useTheme';
import { handleLogout } from "../../utils/navbarFunctions";
import { Modal } from 'antd';
import { RootState } from '../../redux/store';

export const Sidebar = () => {
  const { isActiveMenu, themeMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const isUser = useSelector((state: RootState) => state.user);
  
  // Add state for modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  const links = userLinks;
  
  const toggleMenu = () => dispatch(setActiveMenu(!isActiveMenu));
  const toggleSubMenu = (title: string) => setActiveSubMenu(activeSubMenu === title ? null : title);

  // Show modal
  const showLogoutConfirm = () => {
    setIsModalVisible(true);
  };

  // Handle OK button in modal
  const handleOk = () => {
    setIsModalVisible(false);
    handleLogout({ isUser, dispatch, navigate });
  };

  // Handle Cancel button in modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <button 
        onClick={toggleMenu} 
        className="p-4 md:hidden hover:opacity-80 transition-opacity" 
        style={{ backgroundColor: themeMode === 'dark' ? '#333' : '#fff', color: themeMode === 'dark' ? '#fff' : '#000' }}
      >
        <FiMenu className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full transition-all ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} duration-300 z-40 ${isActiveMenu ? 'w-64 shadow-lg' : 'w-0'} overflow-hidden`}>
        {isActiveMenu && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-center items-center p-4  border-gray-200 dark:border-gray-700">
              <NavLink
                to={`/dashboard`}
                className="group hover:opacity-90 transition-opacity"
              >
                <h1 className={`font-bold text-xl text-center ${themeMode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  [Inventory Management]
                </h1>
              </NavLink>
            </div>

            {/* Navigation Links */}
            <div className="flex-grow overflow-y-auto py-2">
              {links.map((item, index) => (
                <div key={index} className="px-3 py-1">
                  <NavLink
                    to={item.route}
                    className={({ isActive }) =>
                      `flex items-center gap-4 p-3 rounded-lg font-semibold transition-all duration-200
                      ${isActive ? 'shadow-md' : ''}
                      hover:shadow-lg hover:scale-[1.02] hover:brightness-110`
                    }
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? '#106de6' : 'transparent', // Blue background for active
                      color: isActive ? 'white' : themeMode === 'dark' ? 'white' : 'black',
                    })}
                    onClick={() => item.hasSubMenu && toggleSubMenu(item.title)}
                  >
                    <i className={`${item.icon} text-xl flex-shrink-0`}></i>
                    <span className="flex-grow">{item.title}</span>
                    {item.hasSubMenu && (
                      <span className="flex-shrink-0">
                        {activeSubMenu === item.title ? <FiChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </span>
                    )}
                  </NavLink>

                  {/* Submenu */}
                  {item.hasSubMenu && activeSubMenu === item.title && (
                    <div className="pl-6 mt-1 space-y-1">
                      {item.subLinks?.map((subItem, subIndex) => (
                        <NavLink
                          key={subIndex}
                          to={subItem.route}
                          className={({ isActive }) =>
                            `flex items-center gap-4 p-3 rounded-lg font-medium transition-all duration-200 
                            ${isActive ? 'shadow-md' : ''}
                            hover:shadow-lg hover:scale-[1.02] hover:brightness-110`
                          }
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? '#1e40af' : 'transparent', // Blue background for active
                            color: isActive ? 'white' : themeMode === 'dark' ? 'white' : 'black',
                          })}
                        >
                          <i className={`${subItem.icon} text-xl flex-shrink-0`}></i>
                          <span className="flex-grow">{subItem.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Logout Button */}
            <div className="mt-auto p-4  border-gray-200 dark:border-gray-700">
              <button
                onClick={showLogoutConfirm}
                className="w-full flex items-center gap-4 p-3 rounded-lg font-semibold transition-all duration-200
                hover:shadow-lg hover:scale-[1.02] hover:brightness-110
                text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiLogOut className="text-xl flex-shrink-0" />
                <span className="flex-grow">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Modal */}
      <Modal
        title="Logout Confirmation"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
        okButtonProps={{ style: { backgroundColor: '#1e40af', borderColor: '#1e40af' } }} // Blue OK button
      >
        <p>Are you sure you want to logout?</p>
      </Modal>

      {/* Overlay */}
      {isActiveMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={toggleMenu}
        ></div>
      )}
    </div>
  );
};