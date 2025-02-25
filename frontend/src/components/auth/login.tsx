import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import LoginImage from "../../assets/2700025.jpg"

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

export function Login(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  
  const onFinish = (values: LoginFormValues): void => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login successful:', values);
      setLoading(false);
      // Add your login logic here
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
  {/* Main Box containing both image and form */}
  <motion.div 
    className="w-[900px] h-[500px] bg-white rounded-lg shadow-lg flex overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Left side - Image */}
    <div className="w-1/2  flex items-center justify-center p-8">
      <motion.img 
        src={LoginImage} 
        alt="Inventory Management" 
        className="w-4/5 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
    </div>

    {/* Right side - Login form */}
    <div className="w-1/2 p-8 flex flex-col justify-center">
      <div className="w-full max-w-sm mx-auto">
        <Title level={2} className="text-center mb-4">Inventory Management</Title>
        <Title level={4} className="text-center mb-6 text-gray-500">Sign in to your account</Title>
        
        <Form
          name="login"
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
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
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
                  <ClipLoader size={20} color="#ffffff" className="mr-2" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text>Don't have an account? <Link to="/signup" className="text-blue-500">Sign up now</Link></Text>
          </div>
        </Form>
      </div>
    </div>
  </motion.div>
</div>

  );
}