import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import EmployeeLayout from './layouts/EmployeeLayout';
import AdminLayout from './layouts/AdminLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeHistory from './pages/employee/History';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeLeave from './pages/employee/Leave';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployees from './pages/admin/Employees';
import AdminAttendance from './pages/admin/Attendance';
import AdminReports from './pages/admin/Reports';
import WFHRequests from './pages/admin/WFHRequests';
import AdminLeaveRequests from './pages/admin/LeaveRequests';
import AdminEmployeeAttendance from './pages/admin/EmployeeAttendance';
import LoadingScreen from './components/common/LoadingScreen';
import UpdateNoticeModal from './components/common/UpdateNoticeModal';

const PrivateRoute = ({ children, adminOnly = false, employeeOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (employeeOnly && user.role === 'admin') return <Navigate to="/admin" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <>
      {/* Show update notice to all logged-in users once */}
      {user && <UpdateNoticeModal />}

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />}
        />

        {/* Employee Routes */}
        <Route path="/" element={<PrivateRoute employeeOnly><EmployeeLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="history"   element={<EmployeeHistory />} />
          <Route path="leave"     element={<EmployeeLeave />} />
          <Route path="profile"   element={<EmployeeProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
          <Route index                              element={<AdminDashboard />} />
          <Route path="employees"                   element={<AdminEmployees />} />
          <Route path="employees/:id/attendance"    element={<AdminEmployeeAttendance />} />
          <Route path="attendance"                  element={<AdminAttendance />} />
          <Route path="reports"                     element={<AdminReports />} />
          <Route path="wfh-requests"                element={<WFHRequests />} />
          <Route path="leave-requests"              element={<AdminLeaveRequests />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />} />
      </Routes>
    </>
  );
}