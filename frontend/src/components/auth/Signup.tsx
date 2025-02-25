import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";

const { Title, Text } = Typography;

interface SignupFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function Signup(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  
  const onFinish = (values: SignupFormValues): void => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Signup successful:', values);
      setLoading(false);
      // Add your signup logic here
    }, 1500);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-green-600 items-center justify-center p-4">
        <motion.img 
          src="/inventory-management.svg" 
          alt="Inventory Management" 
          className="w-4/5 max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={2} className="text-center mb-6">Inventory Management</Title>
          <Title level={4} className="text-center mb-8 text-gray-500">Create your account</Title>
          
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <Form
              name="signup"
              layout="vertical"
              onFinish={onFinish}
              size="large"
              className="space-y-4"
            >
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
                  { min: 8, message: 'Password must be at least 8 characters!' }
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
                      <ClipLoader size={20}  className="mr-2" />
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
        </motion.div>
      </div>
    </div>
  );
}