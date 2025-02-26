import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoutes } from './routes/PublicRoute';
import { UserRoutes } from './routes/UserRoutes';

function App() {

  return (
    <Router>
      <Routes>
      <Route path='/*'  element={  <PublicRoutes />} />
      <Route path="/user/*" element={ <UserRoutes /> } />
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
     
  )
}

export default App
