import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreateStudent from './pages/CreateStudent';
// Import mới
import MediaManager from './pages/admin/MediaManager';
import ClassManager from './pages/admin/ClassManager';
import MyLearning from './pages/student/MyLearning';

// Giữ nguyên AdminRoute cũ
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

// Component bảo vệ Student
const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Cho phép cả admin xem trang student để test, hoặc chặn tùy bạn
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/create-student" element={<AdminRoute><CreateStudent /></AdminRoute>} />
        {/* Route mới */}
        <Route path="/admin/upload" element={<AdminRoute><MediaManager /></AdminRoute>} />
        <Route path="/admin/classes" element={<AdminRoute><ClassManager /></AdminRoute>} />

        {/* --- STUDENT ROUTES --- */}
        <Route path="/my-learning" element={<StudentRoute><MyLearning /></StudentRoute>} />

        {/* Mặc định: Nếu là admin về dashboard, nếu là student về my-learning */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;