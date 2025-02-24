import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import AuthLayout from "./auth/auth-layout";
import Login from "./auth/login";
import Registration from "./auth/registration";
import ForgotPassword from "./auth/forgot-password";
import Layout from "./modules/restaurant/features/layout/layout";
import Shops from "./modules/restaurant/features/shops/shops";
import Menu from "./modules/restaurant/features/menu/menu";
import Orders from "./modules/restaurant/features/menu/order";
import ViewShop from "./modules/restaurant/features/shops/view-shop";
import Reports from "./modules/restaurant/features/reports/reports";
import Subscriptions from "./modules/restaurant/features/subscriptions/subscriptions";
import Reservations from "./modules/restaurant/features/reservations/reservations";
import Reservation from "./modules/restaurant/features/reservations/reservation";
import AdminLayout from "./modules/admin/features/layout/layout";
import Operations from "./modules/admin/features/operations/operations";
import ViewOrderOperations from "./modules/admin/features/operations/view-order-operations";
import Settings from "./modules/restaurant/features/settings/settings";
import { selectAuth } from "./redux/api/auth/auth.slice";
import ProtectedRoute from "./protected-routes/protect-routes";
import NotFound from "./not-found/not-found";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { isAuthenticated } = useSelector(selectAuth);
  const isAdmin = true; // Hardcoded to true to show admin routes

  const restaurantRoutes = (
    <>
      <Route index element={<Shops />} />
      <Route path="shops" element={<Shops />} />
      <Route path="shops/:id" element={<ViewShop />} />
      <Route path="settings" element={<Settings />} />
      <Route path="menu" element={<Menu />} />
      <Route path="reports" element={<Reports />} />
      <Route path="menu/orders" element={<Orders />} />
      <Route path="subscriptions" element={<Subscriptions />} />
      <Route path="reservations" element={<Reservations />} />
      <Route path="reservations/:id" element={<Reservation />} />
    </>
  );

  const adminRoutes = (
    <>
      <Route index element={<Operations />} />
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
                path="/"
                element={
                  <AuthLayout>
                    <Login />
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
                    <ForgotPassword />
                  </AuthLayout>
                }
              />
            </>
          ) : (
            <>
              {/* Restaurant Routes */}
              <Route element={<ProtectedRoute isAdminRoute={false} />}>
                <Route path="/" element={<Layout />}>
                  {restaurantRoutes}
                </Route>
              </Route>

              {/* Admin Routes - Will always show because isAdmin is hardcoded */}
              <Route element={<ProtectedRoute isAdminRoute={true} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  {adminRoutes}
                </Route>
              </Route>
            </>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </Router>
  );
};

export default App;