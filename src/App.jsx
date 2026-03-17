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
import TuitionManager from './pages/admin/TuitionManager';
import AnnouncementManager from './pages/admin/AnnouncementManager';
import MyTuition from './pages/student/MyTuition';
import MyPerformance from './pages/student/MyPerformance';
import Profile from './pages/student/Profile';
import Achievements from './pages/student/Achievements';
import Flashcards from './pages/student/Flashcards';
import LessonView from './pages/student/LessonView';
import DocumentMarketplace from './pages/student/DocumentMarketplace';
import DocumentDetail from './pages/student/DocumentDetail';
import MyDocuments from './pages/student/MyDocuments';
import StudyChat from './pages/student/StudyChat';
import LessonManager from './pages/admin/LessonManager';
import DocumentManager from './pages/admin/DocumentManager';
import DocumentAnalytics from './pages/admin/DocumentAnalytics';
import { useAuth } from './auth/useAuth';

// Initialize theme on app load
const initTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};
initTheme();

const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
      <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang khởi tạo phiên đăng nhập...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { initializing, isAuthenticated, user } = useAuth();

  if (initializing) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { initializing, isAuthenticated, user } = useAuth();

  if (initializing) return <FullPageLoader />;
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><StudentManager /></ProtectedRoute>} />
        <Route path="/admin/classes" element={<ProtectedRoute requiredRole="admin"><ClassManager /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute requiredRole="admin"><MediaManager /></ProtectedRoute>} />
        <Route path="/admin/questions" element={<ProtectedRoute requiredRole="admin"><QuestionPool /></ProtectedRoute>} />
        <Route path="/admin/quizzes" element={<ProtectedRoute requiredRole="admin"><QuizManager /></ProtectedRoute>} />
        <Route path="/admin/tuition" element={<ProtectedRoute requiredRole="admin"><TuitionManager /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute requiredRole="admin"><AnnouncementManager /></ProtectedRoute>} />
        <Route path="/admin/classes/:classId/lessons" element={<ProtectedRoute requiredRole="admin"><LessonManager /></ProtectedRoute>} />
        <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><DocumentManager /></ProtectedRoute>} />
        <Route path="/admin/documents/analytics" element={<ProtectedRoute requiredRole="admin"><DocumentAnalytics /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><MyLearning /></ProtectedRoute>} />
        <Route path="/student/class/:id" element={<ProtectedRoute requiredRole="student"><ClassDetail /></ProtectedRoute>} />
        <Route path="/student/quizzes" element={<ProtectedRoute requiredRole="student"><QuizList /></ProtectedRoute>} />
        <Route path="/student/quiz/:attemptId" element={<ProtectedRoute requiredRole="student"><DoQuiz /></ProtectedRoute>} />
        <Route path="/student/quiz-result/:attemptId" element={<ProtectedRoute requiredRole="student"><QuizResult /></ProtectedRoute>} />
        <Route path="/student/tuition" element={<ProtectedRoute requiredRole="student"><MyTuition /></ProtectedRoute>} />
        <Route path="/student/performance" element={<ProtectedRoute requiredRole="student"><MyPerformance /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><Profile /></ProtectedRoute>} />
        <Route path="/student/achievements" element={<ProtectedRoute requiredRole="student"><Achievements /></ProtectedRoute>} />
        <Route path="/student/flashcards" element={<ProtectedRoute requiredRole="student"><Flashcards /></ProtectedRoute>} />
        <Route path="/student/class/:classId/lessons" element={<ProtectedRoute requiredRole="student"><LessonView /></ProtectedRoute>} />
        <Route path="/student/documents" element={<ProtectedRoute requiredRole="student"><DocumentMarketplace /></ProtectedRoute>} />
        <Route path="/student/documents/:id" element={<ProtectedRoute requiredRole="student"><DocumentDetail /></ProtectedRoute>} />
        <Route path="/student/my-documents" element={<ProtectedRoute requiredRole="student"><MyDocuments /></ProtectedRoute>} />
        <Route path="/student/chat" element={<ProtectedRoute requiredRole="student"><StudyChat /></ProtectedRoute>} />

        {/* Legacy redirect */}
        <Route path="/my-learning" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
