import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./features/layout/layout"
import AuthLayout from "./features/auth/auth-layout"
import Login from "./features/auth/login" // Replace with your actual Login component
import { Suspense } from "react"
import Registration from "./features/auth/registration"
import ForgotPassword from "./features/auth/forgot-password"
import Shops from "./features/shops/shops"
import Menu from "./features/menu/menu"
import Reservations from "./features/reservations/reservations"
import Reservation from "./features/reservations/reservation"

const App = () => {
  const isAuthenticated = false

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
          <Route path="/" element={<Layout />}>
            <Route index element={<div>hello</div>} />
            <Route path="shops" element={<Shops />} />
            <Route path="settings" element={<div>settings</div>} />
            <Route path="menu" element={<Menu />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="reservations/:id" element={<Reservation />} />
          </Route>
        )}
      </Routes>
    </Router>
  )
}

export default App
