"use client";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthSessionProvider from "./SessionProvider";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";
import AuthWatcher from "@/components/AuthWatcher";
import { ArrowUpCircleIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Footer from "@/components/Footer";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";

import { ChatBot } from '@/components/gabriel';
import { openChatBot, triggerChatbotAttention } from '@/store/popUpSlice';

function RootLayoutContent({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsVisible(window.scrollY > 300);
    }
  }, []);

  const handleChat = () => {
    dispatch(triggerChatbotAttention());
    dispatch(openChatBot(true));
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      // Check if script already exists to prevent duplicate injection
      const existingScript = document.querySelector('script[src*="tawk.to"]');
      if (existingScript) return;
      
      const s1 = document.createElement("script");
      s1.src = "https://embed.tawk.to/687f67477efc30191580053b/1j0oqms9t";
      s1.async = true;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      document.body.appendChild(s1);
    }
  }, [mounted]);

  
  // Check if we're on the homepage
  const isAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/user");

  return (
    <>
      <AuthSessionProvider>
        <AuthWatcher /> 
        <UserProvider>
          <ToastProvider>
            <CartProvider>
              {!isAdmin && <Navbar />}
              {children}

              {/* <ChatBot /> */}
            </CartProvider>
          </ToastProvider>
        </UserProvider>
      </AuthSessionProvider>

      {mounted && isVisible && 
        <button
          onClick={scrollToTop}
          className="fixed bottom-25 right-9 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
          aria-label="Scroll to top"
        >
          <ArrowUpCircleIcon className="w-6 h-6" />
        </button>
      }

      {!isAdmin && <Footer />}
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100" suppressHydrationWarning>
        <Provider store={store}>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Provider>
      </body>
    </html>
  );
}
