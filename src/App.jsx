import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentManager from './pages/admin/StudentManager';
import MediaManager from './pages/admin/MediaManager';
import ClassManager from './pages/admin/ClassManager';
import MyLearning from './pages/student/MyLearning';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><StudentManager /></AdminRoute>} />
        <Route path="/admin/classes" element={<AdminRoute><ClassManager /></AdminRoute>} />
        <Route path="/admin/upload" element={<AdminRoute><MediaManager /></AdminRoute>} />

        {/* Student */}
        <Route path="/my-learning" element={<StudentRoute><MyLearning /></StudentRoute>} />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;