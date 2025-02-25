import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import {DashBoardLayout} from './components/dashboard/Main';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<DashBoardLayout />} />

      </Routes>
    </Router>
     
  )
}

export default App
