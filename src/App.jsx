import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';

const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StudentManager = lazy(() => import('./pages/admin/StudentManager'));
const MediaManager = lazy(() => import('./pages/admin/MediaManager'));
const ClassManager = lazy(() => import('./pages/admin/ClassManager'));
const QuestionPool = lazy(() => import('./pages/admin/QuestionPool'));
const QuizManager = lazy(() => import('./pages/admin/QuizManager'));
const MyLearning = lazy(() => import('./pages/student/MyLearning'));
const ClassDetail = lazy(() => import('./pages/student/ClassDetail'));
const QuizList = lazy(() => import('./pages/student/QuizList'));
const DoQuiz = lazy(() => import('./pages/student/DoQuiz'));
const QuizResult = lazy(() => import('./pages/student/QuizResult'));
const TuitionManager = lazy(() => import('./pages/admin/TuitionManager'));
const AnnouncementManager = lazy(() => import('./pages/admin/AnnouncementManager'));
const MyTuition = lazy(() => import('./pages/student/MyTuition'));
const MyPerformance = lazy(() => import('./pages/student/MyPerformance'));
const Profile = lazy(() => import('./pages/student/Profile'));
const Achievements = lazy(() => import('./pages/student/Achievements'));
const Flashcards = lazy(() => import('./pages/student/Flashcards'));
const LessonView = lazy(() => import('./pages/student/LessonView'));
const DocumentMarketplace = lazy(() => import('./pages/student/DocumentMarketplace'));
const DocumentDetail = lazy(() => import('./pages/student/DocumentDetail'));
const MyDocuments = lazy(() => import('./pages/student/MyDocuments'));
const StudyChat = lazy(() => import('./pages/student/StudyChat'));
const LessonManager = lazy(() => import('./pages/admin/LessonManager'));
const DocumentManager = lazy(() => import('./pages/admin/DocumentManager'));
const DocumentAnalytics = lazy(() => import('./pages/admin/DocumentAnalytics'));
const LeadManager = lazy(() => import('./pages/admin/LeadManager'));

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

const RoutePage = ({ Component }) => (
  <Suspense fallback={<FullPageLoader />}>
    <Component />
  </Suspense>
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
        <Route path="/login" element={<PublicOnlyRoute><RoutePage Component={Login} /></PublicOnlyRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={AdminDashboard} /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={StudentManager} /></ProtectedRoute>} />
        <Route path="/admin/classes" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={ClassManager} /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={MediaManager} /></ProtectedRoute>} />
        <Route path="/admin/questions" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={QuestionPool} /></ProtectedRoute>} />
        <Route path="/admin/quizzes" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={QuizManager} /></ProtectedRoute>} />
        <Route path="/admin/tuition" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={TuitionManager} /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={AnnouncementManager} /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={LeadManager} /></ProtectedRoute>} />
        <Route path="/admin/classes/:classId/lessons" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={LessonManager} /></ProtectedRoute>} />
        <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={DocumentManager} /></ProtectedRoute>} />
        <Route path="/admin/documents/analytics" element={<ProtectedRoute requiredRole="admin"><RoutePage Component={DocumentAnalytics} /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><RoutePage Component={MyLearning} /></ProtectedRoute>} />
        <Route path="/student/class/:id" element={<ProtectedRoute requiredRole="student"><RoutePage Component={ClassDetail} /></ProtectedRoute>} />
        <Route path="/student/quizzes" element={<ProtectedRoute requiredRole="student"><RoutePage Component={QuizList} /></ProtectedRoute>} />
        <Route path="/student/quiz/:attemptId" element={<ProtectedRoute requiredRole="student"><RoutePage Component={DoQuiz} /></ProtectedRoute>} />
        <Route path="/student/quiz-result/:attemptId" element={<ProtectedRoute requiredRole="student"><RoutePage Component={QuizResult} /></ProtectedRoute>} />
        <Route path="/student/tuition" element={<ProtectedRoute requiredRole="student"><RoutePage Component={MyTuition} /></ProtectedRoute>} />
        <Route path="/student/performance" element={<ProtectedRoute requiredRole="student"><RoutePage Component={MyPerformance} /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><RoutePage Component={Profile} /></ProtectedRoute>} />
        <Route path="/student/achievements" element={<ProtectedRoute requiredRole="student"><RoutePage Component={Achievements} /></ProtectedRoute>} />
        <Route path="/student/flashcards" element={<ProtectedRoute requiredRole="student"><RoutePage Component={Flashcards} /></ProtectedRoute>} />
        <Route path="/student/class/:classId/lessons" element={<ProtectedRoute requiredRole="student"><RoutePage Component={LessonView} /></ProtectedRoute>} />
        <Route path="/student/documents" element={<ProtectedRoute requiredRole="student"><RoutePage Component={DocumentMarketplace} /></ProtectedRoute>} />
        <Route path="/student/documents/:id" element={<ProtectedRoute requiredRole="student"><RoutePage Component={DocumentDetail} /></ProtectedRoute>} />
        <Route path="/student/my-documents" element={<ProtectedRoute requiredRole="student"><RoutePage Component={MyDocuments} /></ProtectedRoute>} />
        <Route path="/student/chat" element={<ProtectedRoute requiredRole="student"><RoutePage Component={StudyChat} /></ProtectedRoute>} />

        {/* Legacy redirect */}
        <Route path="/my-learning" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
