import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Modal, Form, Space, Popconfirm, message, Pagination,
  Typography, Row, Col, Card, Spin, Divider, Select, Dropdown
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined,
  ReloadOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined,
  DownloadOutlined, FileExcelOutlined, FilePdfOutlined, PrinterOutlined, SendOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { userInstance } from '../../middlewares/axios';
import { exportToExcel, exportToPdf, printData } from '../../utils/CustomerFunctions';
import { EmailExportModal } from '../dashboard/Email';

const { Title } = Typography;
const { Option } = Select;

interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  address: CustomerAddress;
}

interface CustomerFormValues {
  name: string;
  email: string;
  mobileNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface EmailFormValues {
  recipient: string;
  subject: string;
  message: string;
}

export function Customers(): React.ReactElement {
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('Add Customer');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>('');
  const [emailModalVisible, setEmailModalVisible] = useState<boolean>(false);
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [emailForm] = Form.useForm();

  // Fetch all customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await userInstance.get('api/customer/list-customers');
      setAllCustomers(response.data.customers || []);
    } catch (error) {
      message.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let filteredData = [...allCustomers];

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      filteredData = filteredData.filter(customer =>
        customer.name.toLowerCase().includes(lowerCaseSearch) ||
        customer.email.toLowerCase().includes(lowerCaseSearch) ||
        customer.mobileNumber.toLowerCase().includes(lowerCaseSearch) ||
        customer.address.city.toLowerCase().includes(lowerCaseSearch) ||
        customer.address.country.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    setCustomers(paginatedData);
  }, [allCustomers, searchText, currentPage, pageSize]);

  // Add new customer
  const addCustomer = async (values: CustomerFormValues) => {
    setLoading(true);
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
          country: values.country
        }
      };

      const response = await userInstance.post('api/customer/add-customer', customerData);
      if (response.status === 201) {
        message.success('Customer added successfully');
      }

      setAllCustomers([...allCustomers, response.data.customer]);

      form.resetFields();
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to add customer');
      console.error('Error adding customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update customer
  const updateCustomer = async (values: CustomerFormValues) => {
    if (!editingCustomer) return;

    setLoading(true);
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
          country: values.country
        }
      };

      const response = await userInstance.put(`api/customer/update-customer/${editingCustomer._id}`, customerData);
      message.success('Customer updated successfully');

      // Update local state with the updated customer
      setAllCustomers(allCustomers.map(customer =>
        customer._id === editingCustomer._id ? response.data.customer : customer
      ));

      form.resetFields();
      setModalVisible(false);
      setEditingCustomer(null);
    } catch (error) {
      message.error('Failed to update customer');
      console.error('Error updating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string) => {
    setLoading(true);
    try {
      await userInstance.delete(`api/customer/delete-customer/${id}`);
      message.success('Customer deleted successfully');

      // Update local state by removing the deleted customer
      setAllCustomers(allCustomers.filter(customer => customer._id !== id));

      // If deleting the last item on a page, go back to previous page
      const remainingFilteredItems = allCustomers
        .filter(customer => customer._id !== id)
        .filter(customer => {
          if (!searchText) return true;
          const lowerCaseSearch = searchText.toLowerCase();
          return customer.name.toLowerCase().includes(lowerCaseSearch) ||
            customer.email.toLowerCase().includes(lowerCaseSearch) ||
            customer.mobileNumber.toLowerCase().includes(lowerCaseSearch) ||
            customer.address.city.toLowerCase().includes(lowerCaseSearch) ||
            customer.address.country.toLowerCase().includes(lowerCaseSearch);
        });

      const totalPages = Math.ceil(remainingFilteredItems.length / pageSize);
      if (currentPage > totalPages && currentPage > 1) {
        setCurrentPage(totalPages || 1);
      }
    } catch (error) {
      message.error('Failed to delete customer');
      console.error('Error deleting customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (values: CustomerFormValues) => {
    if (editingCustomer) {
      updateCustomer(values);
    } else {
      addCustomer(values);
    }
  };

  // Open modal for add/edit
  const showModal = (customer?: Customer) => {
    if (customer) {
      setModalTitle('Edit Customer');
      setEditingCustomer(customer);
      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        mobileNumber: customer.mobileNumber,
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.zipCode,
        country: customer.address.country
      });
    } else {
      setModalTitle('Add Customer');
      setEditingCustomer(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Reset search
  const resetSearch = () => {
    setSearchText('');
    setCurrentPage(1);
  };

  // Get filtered data count for pagination
  const getFilteredTotal = () => {
    if (!searchText) return allCustomers.length;

    const lowerCaseSearch = searchText.toLowerCase();
    return allCustomers.filter(customer =>
      customer.name.toLowerCase().includes(lowerCaseSearch) ||
      customer.email.toLowerCase().includes(lowerCaseSearch) ||
      customer.mobileNumber.toLowerCase().includes(lowerCaseSearch) ||
      customer.address.city.toLowerCase().includes(lowerCaseSearch) ||
      customer.address.country.toLowerCase().includes(lowerCaseSearch)
    ).length;
  };

  // Export functions
  const handleExportToExcel = () => {
    // Use either filtered data or all data based on search
    const dataToExport = searchText ? customers : allCustomers;

    const formattedData = dataToExport.map(customer => ({
      'Name': customer.name,
      'Email': customer.email,
      'Mobile Number': customer.mobileNumber,
      'Street': customer.address.street,
      'City': customer.address.city,
      'State': customer.address.state,
      'Zip Code': customer.address.zipCode,
      'Country': customer.address.country
    }));

    exportToExcel(formattedData, 'Customers_Report');
    message.success('Customer data exported to Excel successfully');
  };

  const handleExportToPdf = () => {
    // Use either filtered data or all data based on search
    const dataToExport = searchText ? customers : allCustomers;

    const formattedData = dataToExport.map(customer => ({
      'Name': customer.name,
      'Email': customer.email,
      'Mobile': customer.mobileNumber,
      'Address': `${customer.address.city}, ${customer.address.country}`
    }));

    exportToPdf(formattedData, 'Customers_Report', 'Customer List');
    message.success('Customer data exported to PDF successfully');
  };

  const handlePrint = () => {
    // Use either filtered data or all data based on search
    const dataToExport = searchText ? customers : allCustomers;

    const formattedData = dataToExport.map(customer => ({
      'Name': customer.name,
      'Email': customer.email,
      'Mobile': customer.mobileNumber,
      'Address': `${customer.address.city}, ${customer.address.country}`
    }));

    printData(formattedData, 'Customer List');
    message.success('Print initiated successfully');
  };

  const handleEmailModalOpen = () => {
    setEmailModalVisible(true);
    emailForm.resetFields();
  };

  const handleSendEmail = async (values: EmailFormValues) => {
    setEmailSending(true);
    try {
      // Use either filtered data or all data based on search
      const dataToSend = searchText ? customers : allCustomers;

      // Format the data to send
      const formattedData = dataToSend.map(customer => ({
        name: customer.name,
        email: customer.email,
        mobileNumber: customer.mobileNumber,
        address: `${customer.address.city}, ${customer.address.country}`
      }));

      await userInstance.post('api/customer/send-customer-details', {
        email: values.recipient,
        subject: values.subject,
        message: values.message,
        customers: formattedData
      });

      message.success('Customer report sent via email successfully');
      setEmailModalVisible(false);
      emailForm.resetFields();
    } catch (error) {
      message.error('Failed to send email');
      console.error('Error sending email:', error);
    } finally {
      setEmailSending(false);
    }
  };

  // Export dropdown menu items
  const exportMenuItems = [
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: 'Export to Excel',
      onClick: handleExportToExcel
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: 'Export to PDF',
      onClick: handleExportToPdf
    },
    {
      key: 'print',
      icon: <PrinterOutlined />,
      label: 'Print',
      onClick: handlePrint
    },
    {
      key: 'email',
      icon: <SendOutlined />,
      label: 'Send via Email',
      onClick: handleEmailModalOpen
    }
  ];

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span>
          <UserOutlined className="mr-2 text-blue-500" />
          {text}
        </span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (
        <span>
          <MailOutlined className="mr-2 text-green-500" />
          {text}
        </span>
      )
    },
    {
      title: 'Mobile',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
      render: (text: string) => (
        <span>
          <PhoneOutlined className="mr-2 text-purple-500" />
          {text}
        </span>
      )
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: string, record: Customer) => (
        <span>
          <HomeOutlined className="mr-2 text-orange-500" />
          {record.address.city}, {record.address.country}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: string, record: Customer) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete customer"
            description="Are you sure you want to delete this customer?"
            onConfirm={() => deleteCustomer(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Calculate total count based on search filters
  const filteredTotal = getFilteredTotal();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <Card className="w-full shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="m-0">Customers</Title>
          <Space>
            <Dropdown menu={{ items: exportMenuItems }}>
              <Button icon={<DownloadOutlined />} size="large">
                Export <span className="ml-1">▼</span>
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              size="large"
            >
              Add Customer
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Search area */}
        <div className="mb-6">
          <Row gutter={16} className="flex items-center">
            <Col xs={24} sm={16} md={12} lg={8}>
              <Input
                placeholder="Search customers..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetSearch}
                size="large"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </div>

        {/* Customer table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={loading ? 'loading' : 'content'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loading && allCustomers.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Table
                  dataSource={customers}
                  columns={columns}
                  rowKey="_id"
                  pagination={false}
                  className="mb-4"
                  locale={{ emptyText: "No customers found" }}
                />

                <div className="flex justify-end mt-4">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredTotal}
                    onChange={(page) => setCurrentPage(page)}
                    onShowSizeChange={(_, size) => { // Removed 'current' since it's not used
                      setCurrentPage(1);
                      setPageSize(size);
                    }}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `Total ${total} customers`}
                  />
                </div>

              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Customer Modal Form */}
      <Modal
        title={
          <div className="text-xl">
            {modalTitle}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: '',
              email: '',
              mobileNumber: '',
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Please enter customer name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter email" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="mobileNumber"
              label="Mobile Number"
              rules={[{ required: true, message: 'Please enter mobile number' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Enter mobile number" />
            </Form.Item>

            <Divider orientation="left">Address Information</Divider>

            <Form.Item
              name="street"
              label="Street Address"
              rules={[{ required: true, message: 'Please enter street address' }]}
            >
              <Input prefix={<HomeOutlined />} placeholder="Enter street address" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: 'Please enter city' }]}
                >
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="state"
                  label="State/Province"
                  rules={[{ required: true, message: 'Please enter state/province' }]}
                >
                  <Input placeholder="Enter state/province" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="zipCode"
                  label="Zip/Postal Code"
                  rules={[{ required: true, message: 'Please enter zip/postal code' }]}
                >
                  <Input placeholder="Enter zip/postal code" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: 'Please select country' }]}
                >
                  <Select placeholder="Select country">
                    <Option value="United States">United States</Option>
                    <Option value="Canada">Canada</Option>
                    <Option value="United Kingdom">United Kingdom</Option>
                    <Option value="Australia">Australia</Option>
                    <Option value="Germany">Germany</Option>
                    <Option value="France">France</Option>
                    <Option value="India">India</Option>
                    <Option value="Japan">Japan</Option>
                    <Option value="China">China</Option>
                    <Option value="Brazil">Brazil</Option>
                    {/* Add more countries as needed */}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end mt-4">
              <Button onClick={() => setModalVisible(false)} className="mr-2">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </Button>
            </div>
          </Form>
        </motion.div>
      </Modal>

      {/* Email Export Modal */}
      <EmailExportModal
        visible={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        form={emailForm}
        onFinish={handleSendEmail}
        loading={emailSending}
      />
    </motion.div>
  );
}