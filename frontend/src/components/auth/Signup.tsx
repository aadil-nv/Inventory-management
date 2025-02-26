import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import SignupImage from "../../assets/signup.avif";
import { login } from "../../redux/slices/userSlice";
import { useDispatch } from "react-redux";
import axios from 'axios';
import { passwordValidator} from "../../utils/Validator"
import { registerUser } from '../../api/authAPI';

const { Title, Text } = Typography;

interface SignupFormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}



export function Signup(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const onFinish = async (values: SignupFormValues): Promise<void> => {
    setLoading(true);
    setApiError(null);
  
    try {
      await registerUser(values); // Call the API function
  
      dispatch(login({ userName: values.username }));
      message.success('Account created successfully!');
      navigate('/user/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(error.response?.data?.message || 'An error occurred during signup');
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  

 

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      {/* Main Box containing both image and form */}
      <motion.div 
        className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left side - Image */}
          <div className="md:w-1/2 flex items-center justify-center p-8">
            <motion.img 
              src={SignupImage} 
              alt="Inventory Management" 
              className="w-4/5 max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          </div>

          {/* Right side - Signup form */}
          <div className="md:w-1/2 p-8">
            <div className="max-w-md mx-auto">
              <Title level={2} className="text-center mb-4">Inventory Management</Title>
              <Title level={4} className="text-center mb-6 text-gray-500">Create your account</Title>
              
              {apiError && (
                <div className="mb-4 p-2 text-red-500 bg-red-50 border border-red-200 rounded">
                  {apiError}
                </div>
              )}
              
              <Form
                name="signup"
                layout="vertical"
                onFinish={onFinish}
                size="large"
                className="space-y-4"
              >
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input your full name!' }]}
                >
                  <Input 
                    prefix={<UserAddOutlined className="text-gray-400" />} 
                    placeholder="Full Name" 
                  />
                </Form.Item>

                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input your username!' }]}
                >
                  <Input 
                    prefix={<UserOutlined className="text-gray-400" />} 
                    placeholder="Username" 
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email address!' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined className="text-gray-400" />} 
                    placeholder="Email" 
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    passwordValidator
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Confirm Password"
                  />
                </Form.Item>

                <Form.Item className="mb-2">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full h-10 flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ClipLoader size={20} className="mr-2" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </Form.Item>

                <div className="text-center">
                  <Text>Already have an account? <Link to="/" className="text-blue-500">Login now</Link></Text>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}