import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { NavButton, toggleMenu } from "../../utils/navbarFunctions";
import { useTheme } from "../../hooks/useTheme";
import useAuth from "../../hooks/useAuth";

export  function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  
  const { isActiveMenu, themeMode } = useTheme();
  const { user } = useAuth()
  const dispatch = useDispatch();

  const defaultProfileImage = "https://cdn.pixabay.com/photo/2018/08/28/12/41/avatar-3637425_1280.png";
  const userName = user.userName
  const profileImage = defaultProfileImage;

  // Set theme-based colors
  const backgroundColor = themeMode === "dark" ? "black" : "#fff";
  const textColor = themeMode === "dark" ? "#fff" : "#333";

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-between p-2 h-16 shadow-sm fixed top-0 z-40 ${
        isActiveMenu ? "w-[calc(100%-250px)]" : "w-full"
      }`}
      style={{ backgroundColor }}
    >
      <NavButton
        customFunc={() => toggleMenu(dispatch, isActiveMenu)}
        icon={<span>☰</span>}
        themeColor="blue"
      />
      
      <div className="flex items-center space-x-4">


        <motion.div className="relative" whileHover={{ scale: 1.02 }}>
          <motion.button
            type="button"
            className="flex items-center gap-3 p-2 rounded-lg"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              backgroundColor: themeMode === "dark" ? "#444" : "#f1f1f1",
              color: textColor,
            }}
            whileHover={{ backgroundColor: themeMode === "dark" ? "#555" : "#e1e1e1" }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.img
              src={profileImage}
              alt="Profile"
              className="rounded-full w-8 h-8 md:w-9 md:h-9 object-cover border-2"
              style={{ borderColor: textColor }}
              whileHover={{ scale: 1.1 }}
            />
            <span className="hidden sm:inline text-sm font-medium" style={{ color: textColor }}>
              {userName}
            </span>
          </motion.button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md"
                style={{ backgroundColor }}
              >
                {/* Profile Menu Items */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>


      </div>
    </motion.div>
  );
}
