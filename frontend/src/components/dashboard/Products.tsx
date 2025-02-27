import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, InputNumber, Pagination, message, Dropdown, Menu } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { userInstance } from '../../middlewares/axios';
import { exportToExcel, exportToPdf, printData, sendEmail } from '../../utils/ProductFunctions';

// Define interfaces for type safety
interface Product {
  _id: string;
  productName: string;
  description: string;
  quantity: number;
  price: number;
}

interface EmailFormValues {
  email: string;
  subject: string;
  message: string;
}

export function Products() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  const [form] = Form.useForm();
  const [emailForm] = Form.useForm();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle pagination and filtering when products or search changes
  useEffect(() => {
    handleClientSidePagination();
  }, [products, searchText, pagination.current, pagination.pageSize]);

  // Function to fetch all products at once
  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await userInstance.get('api/product/list-products');
      
      setProducts(response.data.products || []);
      setPagination({
        ...pagination,
        total: response.data.products?.length || 0
      });
    } catch (error) {
      message.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle client-side pagination and filtering
  const handleClientSidePagination = (): void => {
    // Filter by product name
    const filteredProducts = products.filter(product => 
      product.productName.toLowerCase().includes(searchText.toLowerCase())
    );
    
    // Calculate pagination
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    
    // Update displayed products and total
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
    setPagination(prev => ({
      ...prev,
      total: filteredProducts.length
    }));
  };

  // Function to add or update a product
  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (currentProduct) {
        // Update existing product
        await userInstance.put(`api/product/update-product/${currentProduct._id}`, values);
        message.success('Product updated successfully');
      } else {
        // Add new product
        await userInstance.post('api/product/add-product', values);
        message.success('Product added successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      message.error(currentProduct ? 'Failed to update product' : 'Failed to add product');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a product
  const handleDelete = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await userInstance.delete(`api/product/delete-product/${id}`);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to open modal for adding a new product
  const showAddModal = (): void => {
    setCurrentProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Function to open modal for editing a product
  const showEditModal = (product: Product): void => {
    setCurrentProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  // Function to handle search
  const handleSearch = (value: string): void => {
    setSearchText(value);
    setPagination(prev => ({
      ...prev,
      current: 1 // Reset to first page on new search
    }));
  };

  // Function to handle pagination change
  const handlePaginationChange = (page: number, pageSize?: number): void => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize
    });
  };

  // Function to handle export to Excel
  const handleExportToExcel = (): void => {
    exportToExcel(products, 'ProductsData');
    message.success('Products exported to Excel successfully');
  };

  // Function to handle export to PDF
  const handleExportToPdf = (): void => {
    exportToPdf(products, 'ProductsData');
    message.success('Products exported to PDF successfully');
  };

  // Function to handle print
  const handlePrint = (): void => {
    printData(products);
    message.success('Print job sent successfully');
  };

  // Function to show email modal
  const showEmailModal = (): void => {
    emailForm.resetFields();
    setIsEmailModalVisible(true);
  };

  // Function to handle sending email using the imported sendEmail function
  const handleSendEmail = async (): Promise<void> => {
    try {
      const values: EmailFormValues = await emailForm.validateFields();
      setLoading(true);
      
      // Use the imported sendEmail function instead of direct API call
      await sendEmail(
        values.email,
        values.subject,
        values.message,
        products
      );
      
      setIsEmailModalVisible(false);
      emailForm.resetFields();
    } catch (error) {
      message.error('Failed to send email');
      console.error('Error sending email:', error);
    } finally {
      setLoading(false);
    }
  };

  // Table columns definition
  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: Product, b: Product) => a.productName.localeCompare(b.productName)
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: Product, b: Product) => a.quantity - b.quantity
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.price - b.price
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <div className="flex space-x-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            size="small"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Export menu items
  const exportMenu = (
    <Menu>
      <Menu.Item key="excel" icon={<FileExcelOutlined />} onClick={handleExportToExcel}>
        Export to Excel
      </Menu.Item>
      <Menu.Item key="pdf" icon={<FilePdfOutlined />} onClick={handleExportToPdf}>
        Export to PDF
      </Menu.Item>
      <Menu.Item key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
        Print
      </Menu.Item>
      <Menu.Item key="email" icon={<MailOutlined />} onClick={showEmailModal}>
        Send via Email
      </Menu.Item>
    </Menu>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex space-x-3">
          <Dropdown overlay={exportMenu} placement="bottomRight">
            <Button icon={<DownloadOutlined />} size="large">
              Export
            </Button>
          </Dropdown>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
              size="large"
            >
              Add Product
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by product name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          className="w-64"
        />
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Table
            dataSource={displayedProducts}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={false}
            className="mb-4"
          />

          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePaginationChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total) => `Total ${total} products`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Product Form Modal */}
      <Modal
        title={currentProduct ? 'Edit Product' : 'Add New Product'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea
              placeholder="Enter product description"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber<number>
              min={0}
              placeholder="Enter quantity"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber<number>
              min={0}
              step={0.01}
              precision={2}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => {
                return value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0;
              }}
              placeholder="Enter price"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Email Modal */}
      <Modal
        title="Send Products Data via Email"
        open={isEmailModalVisible}
        onCancel={() => setIsEmailModalVisible(false)}
        onOk={handleSendEmail}
        confirmLoading={loading}
      >
        <Form
          form={emailForm}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Recipient Email"
            rules={[
              { required: true, message: 'Please enter recipient email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter recipient email" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            initialValue="Products Data"
            rules={[{ required: true, message: 'Please enter email subject' }]}
          >
            <Input placeholder="Enter email subject" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            initialValue="Please find attached the products data."
            rules={[{ required: true, message: 'Please enter email message' }]}
          >
            <Input.TextArea
              placeholder="Enter email message"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}