import { userInstance } from "../middlewares/axios";

interface SignupFormValues {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

export const loginUser = async (email: string, password: string) => {
    return userInstance.post('api/auth/login', { email, password }).then(res => res.data);
  };
  
  export const registerUser = async (values: SignupFormValues) => {
    return userInstance.post('api/auth/register', {
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
    });
  };
    