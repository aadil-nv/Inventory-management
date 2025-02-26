import { body } from "express-validator";

export const registerValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const customerValidation = [
  body("name").trim().notEmpty().withMessage("Customer name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("mobileNumber")
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Mobile number must be between 10-15 digits")
    .isNumeric()
    .withMessage("Mobile number must be numeric"),
  body("address.street").trim().notEmpty().withMessage("Street is required"),
  body("address.city").trim().notEmpty().withMessage("City is required"),
  body("address.state").trim().notEmpty().withMessage("State is required"),
  body("address.zipCode")
    .trim()
    .isPostalCode("any")
    .withMessage("Invalid zip code"),
  body("address.country").trim().notEmpty().withMessage("Country is required"),
];

export const productValidation = [
  body("productName").trim().notEmpty().withMessage("Product name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),
];

export const saleValidation = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format (use YYYY-MM-DD)"),

  body("products")
    .isArray({ min: 1 })
    .withMessage("At least one product is required"),

  body("products.*.productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID format"),

  body("products.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("customerId")
    .notEmpty()
    .withMessage("Customer ID is required"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["Cash", "Online", "Credit Card", "Debit Card", "UPI", "Bank Transfer"])
    .withMessage("Invalid payment method"),
];
