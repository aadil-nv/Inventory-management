import { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, Statistic, Typography, Table, Spin, Alert } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  ShoppingOutlined, 
  DollarOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {userInstance} from '../../middlewares/axios'; // Adjust the import path as needed

const { Content } = Layout;
const { Title } = Typography;

// Type definitions
interface MonthlySales {
  _id: string;
  totalSales: number;
  totalOrders: number;
}

interface TopSellingProduct {
  _id: string;
  totalSold: number;
  productId: string;
  productName: string;
}

interface BestBuyer {
  _id: string;
  totalSpent: number;
  customerId: string;
  customerName: string;
}

interface DashboardData {
  totalCustomers: number;
  totalSales: number;
  totalProducts: number;
  totalRevenue: number;
  averageOrderValue: number;
  monthlySales: MonthlySales[];
  topSellingProducts: TopSellingProduct[];
  bestBuyers: BestBuyer[];
}

interface ApiResponse {
  message: string;
  data: DashboardData;
}

// Chart data interface
interface ChartDataPoint {
  month: string;
  monthKey: string; // For sorting
  sales: number;
  orders: number;
}

// Type for tooltip formatter
type TooltipFormatterCallback = (value: number, name: string) => [string, string];

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await userInstance.get<ApiResponse>('api/dashboard/get-dashboard');
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard data';
          setError(errorMessage);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format month name from "2025-02" to "February 2025"
  const formatMonthName = (monthId: string): string => {
    const [year, month] = monthId.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  // Table columns for top selling products
  const productColumns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Units Sold',
      dataIndex: 'totalSold',
      key: 'totalSold',
      sorter: (a: TopSellingProduct, b: TopSellingProduct) => a.totalSold - b.totalSold,
    },
  ];

  // Table columns for best buyers
  const buyerColumns = [
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (value: number) => `$${value.toFixed(2)}`,
      sorter: (a: BestBuyer, b: BestBuyer) => a.totalSpent - b.totalSpent,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="No data available" description="Could not load dashboard data" type="warning" showIcon />
      </div>
    );
  }

  // Generate all months for the current year
  const generateAllMonths = (): ChartDataPoint[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const allMonthsData: ChartDataPoint[] = [];

    // Create a map of existing data for quick lookup
    const existingDataMap = new Map<string, { sales: number, orders: number }>();
    
    dashboardData.monthlySales.forEach(item => {
      existingDataMap.set(item._id, {
        sales: item.totalSales,
        orders: item.totalOrders
      });
    });

    // Generate data for all months
    for (let month = 0; month < 12; month++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const monthKey = `${currentYear}-${monthStr}`;
      const formattedMonth = formatMonthName(monthKey);
      
      // Use existing data if available, otherwise use zeros
      const existingData = existingDataMap.get(monthKey);
      
      allMonthsData.push({
        month: formattedMonth,
        monthKey: monthKey,
        sales: existingData ? existingData.sales : 0,
        orders: existingData ? existingData.orders : 0
      });
    }

    // Sort by month
    return allMonthsData.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  };

  // Prepare chart data including all months
  const salesChartData = generateAllMonths();

  // Custom tooltip formatter
  const customTooltipFormatter: TooltipFormatterCallback = (value, name) => {
    if (name === 'sales') {
      return [`$${Number(value).toFixed(2)}`, 'Sales'];
    }
    return [value.toString(), 'Orders'];
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Title level={2}>Sales Dashboard</Title>
          </motion.div>

          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card bordered={false}>
                  <Statistic
                    title="Total Revenue"
                    value={dashboardData.totalRevenue}
                    precision={2}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card bordered={false}>
                  <Statistic
                    title="Total Orders"
                    value={dashboardData.totalSales}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ShoppingCartOutlined />}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card bordered={false}>
                  <Statistic
                    title="Total Customers"
                    value={dashboardData.totalCustomers}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card bordered={false}>
                  <Statistic
                    title="Average Order Value"
                    value={dashboardData.averageOrderValue}
                    precision={2}
                    prefix={<ShoppingOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Monthly Sales Chart - Now using LineChart with all months */}
          <motion.div variants={itemVariants}>
            <Card
              title="Monthly Performance"
              bordered={false}
              style={{ marginBottom: '24px' }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#1890ff" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ff7a45" />
                  <Tooltip formatter={customTooltipFormatter} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#1890ff" 
                    activeDot={{ r: 8 }} 
                    name="Sales ($)" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#ff7a45" 
                    name="Orders" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Data Tables */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <motion.div variants={itemVariants}>
                <Card title="Top Selling Products" bordered={false}>
                  <Table
                    dataSource={dashboardData.topSellingProducts}
                    columns={productColumns}
                    rowKey="_id"
                    pagination={false}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div variants={itemVariants}>
                <Card title="Best Customers" bordered={false}>
                  <Table
                    dataSource={dashboardData.bestBuyers}
                    columns={buyerColumns}
                    rowKey="_id"
                    pagination={false}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Content>
    </Layout>
  );
}