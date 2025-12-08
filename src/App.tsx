import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AuthLayout from './auth/auth-layout';
import Login from './auth/login';
import Registration from './auth/registration';
import ForgottenPassword from './auth/forgot-password';
import Layout from './modules/restaurant/features/layout/layout';
import Shops from './modules/restaurant/features/shops/shops';
import Menu from './modules/restaurant/features/menu/menu';
import Orders from './modules/restaurant/features/menu/order';
import ViewShop from './modules/restaurant/features/shops/view-shop';
import Reports from './modules/restaurant/features/reports/reports';
import Subscriptions from './modules/restaurant/features/subscriptions/subscriptions';
import Reservations from './modules/restaurant/features/reservations/reservations';
import Reservation from './modules/restaurant/features/reservations/reservation';
import AdminLayout from './modules/admin/features/layout/layout';
import Operations from './modules/admin/features/operations/operations';
import ViewOrderOperations from './modules/admin/features/operations/view-order-operations';
import Settings from './modules/restaurant/features/settings/settings';
import { selectAuth, setSubdomain } from './redux/api/auth/auth.slice';
import ProtectedRoute from './protected-routes/protect-routes';
import NotFound from './not-found/not-found';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGetRestaurantBySubdomainQuery } from './redux/api/restaurant/restaurant.api';
import SubdomainNotFound from './SubdomainNotFound';
import Inventory from './modules/restaurant/features/inventory';
import Staff from './modules/restaurant/features/staff/staff';
import AddStaff from './modules/restaurant/features/staff/add-staff';
import EditStaff from './modules/restaurant/features/staff/edit-staff';
import VerifyPaymentPage from './modules/restaurant/features/subscriptions/verify-page';
import Dashboard from './modules/restaurant/features/dashboard/dashboard';
import SubscriptionExpired from './SubscriptionExpired';
import Insights from './modules/restaurant/features/insights/insights';
import Attendance from './modules/human-resource/features/attendance/attendance';
import HRDashboard from './modules/human-resource/features/dashboard/hr-dashboard';
import Departments from './modules/human-resource/features/departments/departments';
import ViewDepartment from './modules/human-resource/features/departments/view-department';
import ViewStaff from './modules/restaurant/features/staff/view-staff';
import LeaveTracker from './modules/human-resource/features/leave-tracker/leave-tracker';
import Payroll from './modules/human-resource/features/payroll/payroll';
import SalaryManagement from './modules/human-resource/features/salary/salary';
import VendorInvoices from './modules/restaurant/features/vendor-invoices/vendor-invoices';
import WhatsAppMessages from './modules/restaurant/features/whatsapp/whatsapp-messages';

const App = () => {
  const { isAuthenticated, user, refreshToken } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const host = window.location.href;
  const subdomain = host.split('.')[0].split('//')[1] || 'unknown';

  // Determine if user is SUPER_ADMIN for admin routes
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminSubdomain = subdomain === 'admin';
  const isHumanResource = user?.role === 'HUMAN_RESOURCE';

  // Check if user is allowed to access the dashboard
  const canAccessDashboard = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === "CASHIER" || user?.role === "STORE_KEEPER" || user?.role === "ACCOUNTANT" || user?.role === "COO";

  // Query restaurant data unless accessing admin subdomain with SUPER_ADMIN
  const { data: restaurant, isLoading, isError } = useGetRestaurantBySubdomainQuery(subdomain, {
    skip: isAdminSubdomain && isSuperAdmin,
  });

  // Store refresh token in localStorage
  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }, [refreshToken]);

  // Set subdomain in Redux when restaurant data is available
  useEffect(() => {
    if (restaurant) {
      dispatch(setSubdomain(subdomain));
    }
  }, [restaurant, subdomain, dispatch]);

  // Show loading state while checking restaurant data
  if (isLoading && !(isAdminSubdomain && isSuperAdmin)) {
    return <div className="text-center text-lg">Checking restaurant...</div>;
  }

  // Show SubdomainNotFound if restaurant query fails and not on admin subdomain
  if (isError && !isAdminSubdomain) {
    return <SubdomainNotFound />;
  }

  // Define restaurant routes for non-SUPER_ADMIN users (ADMIN, WAITER, MANAGER)
  const restaurantRoutes = (
    <>
      <Route
        index
        element={canAccessDashboard ? <Dashboard /> : <Navigate to="/settings" replace />}
      />
      <Route path="shops" element={<Shops />} />
      <Route path="shops/:id" element={<ViewShop />} />
      <Route path="branches/:branchId" element={<ViewShop />} />
      <Route path="settings" element={<Settings />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="menu" element={<Menu />} />
      <Route path="menu-items" element={<Orders />} />
      <Route path="staffs" element={<Staff />} />
      <Route path="staffs/add" element={<AddStaff />} />
      <Route path="staffs/:id/edit" element={<EditStaff />} />
      <Route path="staffs/:id" element={<ViewStaff />} />
      <Route path="reports" element={<Reports />} />
      <Route path="insights" element={<Insights />} />
      <Route path="menu/orders" element={<Orders />} />
      <Route path="subscriptions" element={<Subscriptions />} />
      <Route path="reservations" element={<Reservations />} />
      <Route path="reservations/:id" element={<Reservation />} />
      <Route path="verify-payment" element={<VerifyPaymentPage />} />
      <Route path="expired" element={<SubscriptionExpired />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="leave-tracker" element={<LeaveTracker />} />
      <Route path="salary" element={<SalaryManagement />} />
      <Route path="payroll" element={<Payroll />} />
      <Route path="vendor-invoices" element={<VendorInvoices />} />
      <Route path="whatsapp-messages" element={<WhatsAppMessages />} />
    </>
  );

  // Define HR routes for HUMAN_RESOURCE users
  const hrRoutes = (
    <>
      <Route index element={<HRDashboard />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="staffs" element={<Staff />} />
      <Route path="staffs/add" element={<AddStaff />} />
      <Route path="staffs/:id" element={<ViewStaff />} />
      <Route path="staffs/:id/edit" element={<EditStaff />} />
      <Route path="departments" element={<Departments />} />
      <Route path="departments/:id" element={<ViewDepartment />} />
      <Route path="leave-tracker" element={<LeaveTracker />} />
      <Route path="salary" element={<SalaryManagement />} />
      <Route path="payroll" element={<Payroll />} />
      <Route path="shops" element={<Shops />} />
      <Route path="shops/:id" element={<ViewShop />} />
      <Route path="settings" element={<Settings />} />
      {/* TODO: Add routes for complaints when components are created */}
    </>
  );

  // Define admin routes for SUPER_ADMIN users
  const adminRoutes = (
    <>
      <Route index element={<Operations />} />
      {/* <Route path="agents" element={<AdminAgents />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="shops" element={<AdminShops />} />
      <Route path="settings" element={<AdminSettings />} /> */}
      <Route path="operations" element={<Operations />} />
      <Route path="operations/:date/:id" element={<ViewOrderOperations />} />
    </>
  );

  return (
    <Router>
      <Suspense fallback={<div>loading....</div>}>
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route
                path="/*"
                element={
                  <AuthLayout>
                    <Login subdomain={restaurant} />
                  </AuthLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthLayout>
                    <Registration />
                  </AuthLayout>
                }
              />
              <Route
                path="/reset"
                element={
                  <AuthLayout>
                    <ForgottenPassword />
                  </AuthLayout>
                }
              />
            </>
          ) : (
            <>
              {isHumanResource && (
                <Route element={<ProtectedRoute isAdminRoute={false} />}>
                  <Route path="/" element={<Layout subdomainData={restaurant} />}>
                    {hrRoutes}
                  </Route>
                </Route>
              )}

              {!isSuperAdmin && !isHumanResource && (
                <Route element={<ProtectedRoute isAdminRoute={false} />}>
                  <Route path="/" element={<Layout subdomainData={restaurant} />}>
                    {restaurantRoutes}
                  </Route>
                </Route>
              )}

              {isSuperAdmin && (
                <Route element={<ProtectedRoute isAdminRoute={true} />}>
                  <Route path="/" element={<AdminLayout subdomainData={restaurant} />}>
                    {adminRoutes}
                  </Route>
                </Route>
              )}
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </Suspense>
      <ToastContainer />
    </Router>
  );
};

export default App;