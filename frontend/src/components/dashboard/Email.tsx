import React from 'react';
import { Modal, Form, Input, Button, FormInstance } from 'antd';
import { SendOutlined, MailOutlined, } from '@ant-design/icons';

interface EmailExportModalProps {
  visible: boolean;
  onCancel: () => void;
  form: FormInstance;
  onFinish: (values: EmailFormValues) => void;
  loading: boolean;
}

interface EmailFormValues {
  recipient: string;
  subject: string;
  message: string;
}

export const EmailExportModal: React.FC<EmailExportModalProps> = ({visible,onCancel,form,onFinish,loading}) => {
  return (
    <Modal
      title={
        <div className="text-xl flex items-center">
          <SendOutlined className="mr-2" /> Send Customer Report via Email
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          recipient: '',
          subject: 'Customer Report',
          message: 'Please find attached the customer report as requested.'
        }}
      >
        <Form.Item
          name="recipient"
          label="Recipient Email"
          rules={[
            { required: true, message: 'Please enter recipient email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter recipient email" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Please enter email subject' }]}
        >
          <Input placeholder="Enter email subject" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: 'Please enter email message' }]}
        >
          {/* Removed the prefix prop from TextArea */}
          <Input.TextArea 
            rows={4} 
            placeholder="Enter email message" 
          />
        </Form.Item>

        <div className="flex justify-end mt-4">
          <Button onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SendOutlined />} 
            loading={loading}
          >
            Send Email
          </Button>
        </div>
      </Form>
    </Modal>
  );
};