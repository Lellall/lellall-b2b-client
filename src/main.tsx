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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
