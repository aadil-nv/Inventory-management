import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </Router>
     
  )
}

export default App
