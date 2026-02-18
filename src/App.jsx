import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentManager from './pages/admin/StudentManager';
import MediaManager from './pages/admin/MediaManager';
import ClassManager from './pages/admin/ClassManager';
import QuestionPool from './pages/admin/QuestionPool';
import QuizManager from './pages/admin/QuizManager';
import MyLearning from './pages/student/MyLearning';
import ClassDetail from './pages/student/ClassDetail';
import QuizList from './pages/student/QuizList';
import DoQuiz from './pages/student/DoQuiz';
import QuizResult from './pages/student/QuizResult';

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
        <Route path="/admin/questions" element={<AdminRoute><QuestionPool /></AdminRoute>} />
        <Route path="/admin/quizzes" element={<AdminRoute><QuizManager /></AdminRoute>} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentRoute><MyLearning /></StudentRoute>} />
        <Route path="/student/class/:id" element={<StudentRoute><ClassDetail /></StudentRoute>} />
        <Route path="/student/quizzes" element={<StudentRoute><QuizList /></StudentRoute>} />
        <Route path="/student/quiz/:attemptId" element={<StudentRoute><DoQuiz /></StudentRoute>} />
        <Route path="/student/quiz-result/:attemptId" element={<StudentRoute><QuizResult /></StudentRoute>} />

        {/* Legacy redirect */}
        <Route path="/my-learning" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;