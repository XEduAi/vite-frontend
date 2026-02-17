import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreateStudent from './pages/CreateStudent';

// Component bảo vệ Route: Chỉ Admin mới được vào
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Các Route dành cho Admin (Được bảo vệ) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/create-student" 
          element={
            <AdminRoute>
              <CreateStudent />
            </AdminRoute>
          } 
        />

        {/* Mặc định */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;