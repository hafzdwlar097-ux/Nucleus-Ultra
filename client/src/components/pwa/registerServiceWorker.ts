let didRegister = false;

export function registerServiceWorker() {
  if (didRegister) return;
  didRegister = true;

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        // registered
      })
      .catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err);
      });
  });
}
