import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from "react";
import AuthLayout from './auth/auth-layout';
import Login from './auth/login';
import Registration from './auth/registration';
import ForgotPassword from './auth/forgot-password';
import Layout from './modules/restaurant/features/layout/layout';
// import Layout from './features/layout/layout';
// import AuthLayout from "./features/auth/auth-layout";
// import Login from "./features/auth/login"; // Replace with your actual Login component
// import Registration from "./features/auth/registration";
// import ForgotPassword from "./features/auth/forgot-password";
import Shops from "./modules/restaurant/features/shops/shops";
import Menu from "./modules/restaurant/features/menu/menu";
import Inventory from './modules/restaurant/features/inventory';
import Orders from './modules/restaurant/features/menu/order';
import ViewShop from './modules/restaurant/features/shops/view-shop';
import Reports from './modules/restaurant/features/reports/reports';
import Subscriptions from './modules/restaurant/features/subscriptions/subscriptions';
import Reservations from "./modules/restaurant/features/reservations/reservations"
import Reservation from "./modules/restaurant/features/reservations/reservation"
import AdminLayout from './modules/admin/features/layout/layout';
import Operations from './modules/admin/features/operations/operations';
import ViewOrderOperations from './modules/admin/features/operations/view-order-operations';

const App = () => {
  const isAuthenticated = false
  const isAdmin = true

  const restaurantRoutes = <>
    <Route index element={<div>hello</div>} />
    <Route path="shops" element={<Shops />} />
    <Route path="shops/:id" element={<ViewShop />} />
    <Route path="settings" element={<div>settings</div>} />
    <Route path="menu" element={<Menu />} />
    <Route path="reports" element={<Reports />} />
    <Route path="menu/orders" element={<Orders />} />
    <Route path="subscriptions" element={<Subscriptions />} />
    <Route path="reservations" element={<Reservations />} />
    <Route path="reservations/:id" element={<Reservation />} />
    <Route path="inventory" element={<Inventory />} />
    <Route path="menu/orders" element={<Orders />} />
  </>
  const adminRoutes = <>
    <Route index element={<div>hello</div>} />
    <Route path="operations" element={<Operations />} />
    <Route path="operations/:id" element={<ViewOrderOperations />} />
  </>

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route
              path="/"
              element={
                <Suspense fallback={<div>loading....</div>}>
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<div>loading....</div>}>
                  <AuthLayout>
                    <Registration />
                  </AuthLayout>
                </Suspense>
              }
            />
            <Route
              path="/reset"
              element={
                <Suspense fallback={<div>loading....</div>}>
                  <AuthLayout>
                    <ForgotPassword />
                  </AuthLayout>
                </Suspense>
              }
            />
          </>
        ) : (
          <Route path="/" element={isAdmin ? <AdminLayout /> : <Layout />}>
            {
              isAdmin ? adminRoutes : restaurantRoutes
            }
          </Route>
        )}
      </Routes>
    </Router>
  )
}

export default App
