import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store, persistor } from "./redux/store.js"
import "./index.css"
import App from "./App.js"
import "rc-pagination/assets/index.css"
import "react-loading-skeleton/dist/skeleton.css"
import { ErrorBoundary } from "./components/ui/error-boundary.js"
import MyLayoutProvider from "./features/restaurants/LayoutContext.js"
import { PersistGate } from "redux-persist/integration/react"
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MyLayoutProvider>
            <App />
          </MyLayoutProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
