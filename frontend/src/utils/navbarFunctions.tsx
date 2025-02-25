import { userInstance } from "../middlewares/axios";
import { setActiveMenu } from "../redux/slices/themeSlice";
import { logout as userLogout } from "../redux/slices/userSlice";


import { Dispatch, UnknownAction } from "redux";
import { AppDispatch } from "../redux/store";
import { NavigateFunction } from "react-router-dom";

export interface NavbarFunctionsProps {
    isUser: UserStatus;
    dispatch: AppDispatch;
    navigate: NavigateFunction;
  }
  export interface UserStatus { //! Part of navbar Functions do not remove
    isAuthenticated: boolean;
  }


export const handleLogout = async({isUser,dispatch,navigate,}: NavbarFunctionsProps) => {
  if (isUser.isAuthenticated) {    

    userInstance.post("/communication-service/api/chat/logout");
    dispatch(userLogout());
    navigate("/login");
  } 
};



interface NavButtonProps {
  customFunc: () => void;    // Function that does not take arguments and returns void
  icon: React.ReactNode;     // For the icon, we can accept any valid React node
  themeColor: string;        // For the color, it would be a string (like a hex code or color name)
}

export const NavButton: React.FC<NavButtonProps> = ({ customFunc, icon, themeColor }) => (
  <button
    type="button"
    onClick={customFunc}
    className="relative text-xl rounded-full p-1 transition-all duration-300 ease-in-out transform hover:scale-110"
    style={{ color: themeColor }}
  >
    {icon}
  </button>
);

export const toggleMenu = (dispatch: Dispatch<UnknownAction>, isActiveMenu: boolean) => {
  dispatch(setActiveMenu(!isActiveMenu));
};