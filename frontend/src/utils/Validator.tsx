export const passwordValidator = {
    validator: (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject(new Error('Please input your password!'));
      }
      
      if (value.length < 8) {
        return Promise.reject(new Error('Password must be at least 8 characters!'));
      }
      
      if (!/[A-Z]/.test(value)) {
        return Promise.reject(new Error('Password must contain at least one uppercase letter!'));
      }
      
      if (!/[a-z]/.test(value)) {
        return Promise.reject(new Error('Password must contain at least one lowercase letter!'));
      }
      
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return Promise.reject(new Error('Password must contain at least one special character!'));
      }
      
      return Promise.resolve();
    }
  };