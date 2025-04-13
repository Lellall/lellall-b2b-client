// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import KYCWizard from './KYCWizard';
import Inventory from './modules/restaurant/features/inventory';
import Staff from './modules/restaurant/features/staff/staff';
import VerifyPaymentPage from './modules/restaurant/features/subscriptions/verify-page';
import Dashboard from './modules/restaurant/features/dashboard/dashboard';

const App = () => {
  const { isAuthenticated, user, refreshToken } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const host = window.location.href;
  const subdomain = host.split('.')[0].split('//')[1];
  const { data: restaurant, isLoading, isError, refetch } = useGetRestaurantBySubdomainQuery(subdomain, {
    skip: !subdomain,
  });

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }, [refreshToken]);

  if (restaurant) {
    dispatch(setSubdomain(subdomain));
  }

  if (isLoading) {
    return <div className="text-center text-lg">Checking restaurant...</div>;
  }

  if (isError) {
    return <SubdomainNotFound />;
  }

  const restaurantRoutes = (
    <>
      <Route index element={<Dashboard />} />
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
      <Route path="/verify-payment" element={<VerifyPaymentPage />} />
    </>
  );

  const adminRoutes = (
    <>
      <Route index element={<Operations />} />
      <Route path="operations" element={<Operations />} />
      <Route path="operations/:id" element={<ViewOrderOperations />} />
    </>
  );

  const isKycPending = false; // user?.ownedRestaurant?.kycStatus === 'PENDING';
  const isSuperAdmin = user?.role === 'SUPERADMIN';

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
          ) : isKycPending ? (
            <Route
              path="/*"
              element={
                <KYCWizard
                  restaurantData={restaurant}
                  onComplete={() => refetch()}
                />
              }
            />
          ) : (
            <>
              <Route element={<ProtectedRoute isAdminRoute={false} />}>
                <Route path="/" element={<Layout subdomainData={restaurant} />}>
                  {restaurantRoutes}
                </Route>
              </Route>

              {isSuperAdmin && (
                <Route element={<ProtectedRoute isAdminRoute={true} />}>
                  <Route path="/admin" element={<AdminLayout subdomainData={restaurant} />}>
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