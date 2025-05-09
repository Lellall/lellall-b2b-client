// src/serviceWorkerRegistration.js
export function register() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered for Lellall-eProc:", registration);
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      // New content is available, prompt user to refresh
                      import("react-toastify").then(({ toast }) => {
                        toast.info(
                          "New version available! Click to refresh.",
                          {
                            onClick: () => window.location.reload(),
                            autoClose: false,
                            closeOnClick: false,
                          }
                        );
                      });
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }