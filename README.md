# Inventory Management System

## 🚀 Project Overview
This is an **Inventory Management System** built using **React (Frontend)** and **Node.js with Express (Backend)**. The system allows users to **add, update, delete, and list customers** while maintaining proper error handling and API separation.

## 🛠️ Tech Stack
### Frontend:
- **React** (TypeScript + TSX)
- **Tailwind CSS** (Styling)
- **Axios** (API calls)
- **Ant Design** (UI components)

### Backend:
- **Node.js** (Runtime)
- **Express.js** (Backend framework)
- **MongoDB + Mongoose** (Database)
- **JWT & Bcrypt** (Authentication)
- **Render** (Deployment)

## 📁 Project Structure
```
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── config
│   │   ├── middleware
│   │   ├── services
│   │   ├── index.ts
│   ├── package.json
│   ├── tsconfig.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── api
│   │   ├── context
│   │   ├── App.tsx
│   ├── package.json
│   ├── tsconfig.json
```

## 🔧 Installation & Setup
### 1️⃣ Backend Setup
```sh
git clone <repository_url>
cd backend
npm install
npm run dev
```

### 2️⃣ Frontend Setup
```sh
cd frontend
npm install
npm start
```

## 🔑 Authentication & Security
- **JWT-based Authentication**
- **CORS Handling** for API calls
- **Environment Variables** managed in `.env`

## 📌 API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/customer/list-customers` | Get all customers |
| `POST` | `/api/customer/add-customer` | Add a new customer |
| `PUT` | `/api/customer/update-customer/:id` | Update customer details |
| `DELETE` | `/api/customer/delete-customer/:id` | Delete a customer |

## 🚀 Deployment
- Frontend: Hosted on **Render**
- Backend: Hosted on **Render**

## ❗ Common Issues & Fixes
1. **CORS Issue** → Ensure the backend allows requests from the frontend origin.
2. **Login Logs Out Suddenly** → Check if cookies are set properly (`withCredentials: true`).
3. **Deployment Issues** → Verify environment variables are set correctly.

## 👨‍💻 Contributors
- **[Your Name]** - Developer

## 📜 License
This project is **open-source** and free to use.

