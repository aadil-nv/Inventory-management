import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, Pagination, 
  Space, InputNumber, Popconfirm, Menu, Dropdown, message 
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  DownloadOutlined, FileExcelOutlined, FilePdfOutlined, 
  PrinterOutlined, MailOutlined 
} from '@ant-design/icons';
import { userInstance } from '../../middlewares/axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { 
  exportToExcel, 
  exportToPdf, 
  printSalesData, 
  sendSalesReportEmail,
  ExportFormat,
  EmailData
} from '../../utils/SalesFunctions';

// Types definitions
interface Product {
  _id: string;
  productName: string;
  description: string;
  quantity: number;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
}

interface SaleProduct {
  productId: string | Product;  // Can be either a string ID or a populated Product object
  quantity: number;
  _id?: string;
}

type PaymentMethod = "Cash" | "Online" | "Credit Card" | "Debit Card" | "UPI" | "Bank Transfer";

interface Sale {
  _id: string;
  products: SaleProduct[];
  customerId?: string | Customer;  // Can be either a string ID or a populated Customer object
  customerName?: string;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  date: string;
}

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState<boolean>(false);
  const [emailForm] = Form.useForm();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const pageSize = 5;

  // Fetch data on component mount
  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchCustomers();
  }, []);

  // Update filtered sales whenever sales or search text changes
  useEffect(() => {
    filterSales();
  }, [sales, searchText]);

  const fetchSales = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await userInstance.get('api/sale/list-sales');
      // Handle nested response structure
      const salesData = response.data?.sales || response.data || [];
      setSales(Array.isArray(salesData) ? salesData : []);
    } catch (error) {
      toast.error('Failed to fetch sales');
      console.error(error);
      setSales([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await userInstance.get('api/product/list-products');
      const productsData = response.data?.products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
      setProducts([]);
    }
  };

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await userInstance.get('api/customer/list-customers');
      const customersData = response.data?.customers || response.data || [];
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error(error);
      setCustomers([]);
    }
  };

  const filterSales = (): void => {
    if (!Array.isArray(sales)) {
      setFilteredSales([]);
      return;
    }
    
    if (!searchText) {
      setFilteredSales(sales);
      return;
    }

    const filtered = sales.filter(
      (sale) => {
        let customerName = '';
        if (sale.customerId && typeof sale.customerId === 'object' && 'name' in sale.customerId) {
          customerName = sale.customerId.name || '';
        } else if (sale.customerName) {
          customerName = sale.customerName;
        }
        
        if (
          customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          sale.paymentMethod.toLowerCase().includes(searchText.toLowerCase())
        ) {
          return true;
        }
        
        return sale.products.some(p => {
          let productName = '';
          
          if (typeof p.productId === 'object' && p.productId && 'productName' in p.productId) {
            productName = p.productId.productName || '';
          }
          
          return productName.toLowerCase().includes(searchText.toLowerCase());
        });
      }
    );
    
    setFilteredSales(filtered);
  };

  const showAddModal = (): void => {
    setIsEditMode(false);
    setCurrentSale(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (sale: Sale): void => {
    setIsEditMode(true);
    setCurrentSale(sale);
    
    const formattedProducts = sale.products.map(p => {
      let productId;
      if (typeof p.productId === 'object' && p.productId && '_id' in p.productId) {
        productId = p.productId._id;
      } else {
        productId = p.productId;
      }
      
      return {
        productId,
        quantity: p.quantity,
      };
    });
    
    let customerId;
    if (typeof sale.customerId === 'object' && sale.customerId && '_id' in sale.customerId) {
      customerId = sale.customerId._id;
    } else {
      customerId = sale.customerId;
    }
    
    // Set form values
    form.setFieldsValue({
      customerId,
      paymentMethod: sale.paymentMethod,
      totalPrice: sale.totalPrice,
      date: dayjs(sale.date),
      products: formattedProducts,
    });
    
    setIsModalVisible(true);
  };

  const handleCancel = (): void => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleAddProduct = (): void => {
    const currentProducts = form.getFieldValue('products') || [];
    form.setFieldsValue({
      products: [...currentProducts, { productId: undefined, quantity: 1 }]
    });
  };

  const calculateTotalPrice = (): number => {
    const formProducts = form.getFieldValue('products') || [];
    let total = 0;
    
    formProducts.forEach((item: { productId?: string, quantity?: number }) => {
      if (item.productId && item.quantity) {
        const product = products.find(p => p._id === item.productId);
        if (product) {
          total += product.price * item.quantity;
        }
      }
    });
    
    return total;
  };

  const updateTotalPrice = (): void => {
    const totalPrice = calculateTotalPrice();
    form.setFieldsValue({ totalPrice });
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
  
      const payload = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        products: values.products.map((p: { productId: string; quantity: number }) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      };
  
      if (isEditMode && currentSale) {
        await userInstance.put<{ message: string }>(`api/sale/update-sale/${currentSale._id}`, payload);
        toast.success('Sale updated successfully');
      } else {
        await userInstance.post<{ message: string }>('api/sale/add-sale', payload);
        toast.success('Sale added successfully');
      }
  
      setIsModalVisible(false);
      form.resetFields();
      fetchSales();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Failed to save sale');
      } else {
        toast.error('An unexpected error occurred');
      }
      console.error(error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await userInstance.delete(`api/sale/delete-sale/${id}`);
      toast.success('Sale deleted successfully');
      fetchSales();
    } catch (error) {
      toast.error('Failed to delete sale');
      console.error(error);
    }
  };

  // Export functions
  const handleExportExcel = (): void => {
    try {
      exportToExcel(filteredSales, `sales-report-${dayjs().format('YYYY-MM-DD')}`);
      message.success('Sales report exported to Excel successfully');
    } catch (error) {
      message.error('Failed to export Excel file');
      console.error(error);
    }
  };

  const handleExportPdf = (): void => {
    try {
      exportToPdf(filteredSales, `sales-report-${dayjs().format('YYYY-MM-DD')}`);
      message.success('Sales report exported to PDF successfully');
    } catch (error) {
      message.error('Failed to export PDF file');
      console.error(error);
    }
  };

  const handlePrint = (): void => {
    try {
      printSalesData(filteredSales);
    } catch (error) {
      message.error('Failed to print sales report');
      console.error(error);
    }
  };

  const showEmailModal = (format: ExportFormat): void => {
    setExportFormat(format);
    emailForm.resetFields();
    emailForm.setFieldsValue({
      subject: `Sales Report - ${dayjs().format('YYYY-MM-DD')}`,
      message: `Please find attached the sales report generated on ${dayjs().format('YYYY-MM-DD')}.`
    });
    setIsEmailModalVisible(true);
  };

  const handleEmailSubmit = async (): Promise<void> => {
    try {
      const values = await emailForm.validateFields();
      const emailData: EmailData = {
        email: values.email,
        subject: values.subject,
        message: values.message
      };
      
      await sendSalesReportEmail(filteredSales, emailData, exportFormat);
      
      setIsEmailModalVisible(false);
      emailForm.resetFields();
      message.success(`Sales report sent to ${emailData.email} successfully`);
    } catch (error) {
      message.error('Failed to send email');
      console.error(error);
    }
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="excel" icon={<FileExcelOutlined />} onClick={handleExportExcel}>
        Export as Excel
      </Menu.Item>
      <Menu.Item key="pdf" icon={<FilePdfOutlined />} onClick={handleExportPdf}>
        Export as PDF
      </Menu.Item>
      <Menu.Item key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
        Print
      </Menu.Item>
      <Menu.SubMenu key="email" icon={<MailOutlined />} title="Email as">
        <Menu.Item key="emailExcel" onClick={() => showEmailModal('excel')}>
          Excel
        </Menu.Item>
        <Menu.Item key="emailPdf" onClick={() => showEmailModal('pdf')}>
          PDF
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );

  const paginatedSales = Array.isArray(filteredSales) 
    ? filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
    : [];

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (customerId: string | Customer) => {
        // Handle different customer structures
        if (customerId && typeof customerId === 'object' && 'name' in customerId) {
          return customerId.name || 'Cash Sale';
        }
        return 'Cash Sale';
      },
    },
    {
      title: 'Products',
      dataIndex: 'products',
      key: 'products',
      render: (products: SaleProduct[]) => {
        if (!Array.isArray(products)) return null;
        
        return (
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {products.map((item, index) => {
              let productName = 'Unknown';
              const quantity = item.quantity || 0;
              
              // Handle different product structures
              if (typeof item.productId === 'object' && item.productId && 'productName' in item.productId) {
                productName = item.productId.productName;
              }
              
              return (
                <li key={index}>
                  {productName} x {quantity}
                </li>
              );
            })}
          </ul>
        );
      },
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Sale) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this sale?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="text-2xl font-bold">Sales</h1>
        <Space>
          <Dropdown overlay={exportMenu} placement="bottomRight">
            <Button icon={<DownloadOutlined />}>
              Export
            </Button>
          </Dropdown>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              Add Sale
            </Button>
          </motion.div>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by customer, product, or payment method"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={paginatedSales}
        rowKey="_id"
        loading={loading}
        pagination={false}
        style={{ marginBottom: 16 }}
      />

      <Pagination
        current={currentPage}
        total={Array.isArray(filteredSales) ? filteredSales.length : 0}
        pageSize={pageSize}
        onChange={page => setCurrentPage(page)}
        showSizeChanger={false}
      />

      {/* Sale Modal */}
      <Modal
        title={isEditMode ? 'Edit Sale' : 'Add New Sale'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {isEditMode ? 'Update' : 'Add'}
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            products: [{ productId: undefined, quantity: 1 }],
            paymentMethod: 'Cash',
            totalPrice: 0,
            date: dayjs(),
          }}
        >
          <Form.Item
            name="customerId"
            label="Customer"
          >
            <Select 
              allowClear 
              placeholder="Select a customer (optional for cash sales)"
              options={Array.isArray(customers) ? customers.map(c => ({ label: c.name, value: c._id })) : []}
            />
          </Form.Item>

          <Form.Item label="Products">
            <Button type="dashed" onClick={handleAddProduct} style={{ marginBottom: 8 }}>
              + Add Product
            </Button>
            
            <Form.List name="products">
              {(fields, { remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'productId']}
                        rules={[{ required: true, message: 'Please select a product' }]}
                        style={{ width: '60%', marginRight: 8, marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Select product"
                          options={Array.isArray(products) ? products.map(p => ({ 
                            label: `${p.productName} - $${p.price} (${p.quantity} in stock)`, 
                            value: p._id 
                          })) : []}
                          onChange={() => updateTotalPrice()}
                        />
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Quantity required' }]}
                        style={{ width: '30%', marginRight: 8, marginBottom: 0 }}
                      >
                        <InputNumber
                          min={1}
                          placeholder="Qty"
                          onChange={() => updateTotalPrice()}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      
                      <Button 
                        danger
                        type="link"
                        onClick={() => {
                          remove(name);
                          setTimeout(updateTotalPrice, 0);
                        }}
                      >
                        <DeleteOutlined />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select>
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="Online">Online</Select.Option>
              <Select.Option value="Credit Card">Credit Card</Select.Option>
              <Select.Option value="Debit Card">Debit Card</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
              <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="totalPrice"
            label="Total Price"
            rules={[{ required: true, message: 'Total price required' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              readOnly
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Sale Date"
            rules={[{ required: true, message: 'Date is required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Email Modal */}
      <Modal
        title="Send Sales Report by Email"
        open={isEmailModalVisible}
        onCancel={() => setIsEmailModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEmailModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEmailSubmit}>
            Send
          </Button>,
        ]}
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
            <Input placeholder="example@example.com" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter email subject' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter email message' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <p>Report will be sent as {exportFormat.toUpperCase()} attachment.</p>
        </Form>
      </Modal>
    </motion.div>
  );
}