import { useEffect } from 'react';
import { ToastProvider } from '@/context/ToastContext';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Unregister service worker to prevent it from intercepting API calls
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Service Worker unregistered successfully');
            }
          });
        }
      });
    }
  }, []);

  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  );
}

export default MyApp;
