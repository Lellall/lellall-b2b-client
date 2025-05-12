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
import VerifyPaymentPage from './modules/restaurant/features/subscriptions/verify-page';
import Dashboard from './modules/restaurant/features/dashboard/dashboard';
import SubscriptionExpired from './SubscriptionExpired';

const App = () => {
  const { isAuthenticated, user, refreshToken } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const host = window.location.href;
  const subdomain = host.split('.')[0].split('//')[1] || 'unknown';

  // Determine if user is SUPER_ADMIN for admin routes
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminSubdomain = subdomain === 'admin';

  // Check if user is allowed to access the dashboard
  const canAccessDashboard = user?.role === 'ADMIN' || user?.role === 'MANAGER';

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
      <Route path="settings" element={<Settings />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="menu" element={<Menu />} />
      <Route path="staffs" element={<Staff />} />
      <Route path="reports" element={<Reports />} />
      <Route path="menu/orders" element={<Orders />} />
      <Route path="subscriptions" element={<Subscriptions />} />
      <Route path="reservations" element={<Reservations />} />
      <Route path="reservations/:id" element={<Reservation />} />
      <Route path="verify-payment" element={<VerifyPaymentPage />} />
      <Route path="expired" element={<SubscriptionExpired />} />
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
      <Route path="operations/:id" element={<ViewOrderOperations />} />
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
              {!isSuperAdmin && (
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