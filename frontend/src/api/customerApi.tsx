import { AxiosError } from "axios";
import {userInstance} from "../middlewares/axios"


export interface CustomerFormValues {
    name: string;
    email: string;
    mobileNumber: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }

export const fetchCustomers = async () => {
    try {
      const response = await userInstance.get("api/customer/list-customers");
      return response.data.customers || [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw new Error("Failed to fetch customers");
    }
  };

export const addCustomerApi = async (values: CustomerFormValues) => {
    try {
      const customerData = {
        name: values.name,
        email: values.email,
        mobileNumber: values.mobileNumber,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
      };
  
      const response = await userInstance.post("api/customer/add-customer", customerData);
      return response.data.customer;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Failed to add customer");
      }
      throw new Error("An unknown error occurred");
    }
  };  

  export const updateCustomerApi = async (id: string, values: CustomerFormValues) => {
    const customerData = {
      name: values.name,
      email: values.email,
      mobileNumber: values.mobileNumber,
      address: {
        street: values.street,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
      },
    };
  
    try {
      const response = await userInstance.put(`api/customer/update-customer/${id}`, customerData);
      return response.data.customer; 
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Failed to update customer");
      }
      throw new Error("An unexpected error occurred");
    }
  };  


  export const deleteCustomerApi = async (id: string): Promise<void> => {
    try {
      await userInstance.delete(`api/customer/delete-customer/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Failed to delete customer");
      }
      throw error;
    }
  };