import { Route, Routes } from "react-router-dom";
import {DashBoardLayout} from "../components/dashboard/Main"
import {UserPrivateRoute} from "./UserPrivateRoute";
import { Dashboard } from "../components/dashboard/Dashboard";
import { Customers } from "../components/dashboard/Customers";
import { Products } from "../components/dashboard/Products";
import { Dashboard404 } from "../components/Error/Dashboard404";
import { Sales } from "../components/dashboard/Sales";



export const UserRoutes = () => {



  return (
    <Routes>
      <Route element={<UserPrivateRoute />}>
        <Route element={<DashBoardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />

          <Route path="*" element={<Dashboard404 />} /> 
        </Route>
      </Route>
    </Routes>
  );
};

