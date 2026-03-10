import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store, persistor } from "./redux/store.js"
import "./index.css"
import App from "./App.js"
import "rc-pagination/assets/index.css"
import "react-loading-skeleton/dist/skeleton.css"
import { PersistGate } from "redux-persist/integration/react"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { register } from "./serviceWorkerRegistration";
import { ErrorBoundary } from "react-error-boundary";
import { GlobalErrorFallback } from "./components/ui/error-fallback";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onReset={() => {
        // Reset state here if needed when user clicks "Reload Application"
        window.location.reload();
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
register();