"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData, getApiErrorMessage } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const addToast = toast?.addToast ?? (() => {});
  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const getUserData = async () => {
      if (!mountedRef.current) return;

      if (status !== "authenticated" || !session?.user) {
        setLoading(false);
        return;
      }

      // prevent duplicate fetches (e.g., React StrictMode double invoke)
      if (hasFetchedRef.current) {
        setLoading(false);
        return;
      }
      hasFetchedRef.current = true;

      const userId = session.user.id;
      const token = session.user.jwt;

      try {
        const fullUser = await fetchData("users/" + userId, token);

        if (!mountedRef.current) return;

        if (fullUser) {
          // Ensure nested objects are safely handled
          const safeUser = {
            ...fullUser,
            address:
              fullUser.address && typeof fullUser.address === "object"
                ? `${fullUser.address.street || ""} ${fullUser.address.city || ""} ${fullUser.address.state || ""}`.trim() || null
                : fullUser.address,
            country: fullUser.address?.country || fullUser.country || null,
          };
          setUser(safeUser);
        } else {
          setUser(session.user); // fallback to session user
        }
      } catch (err) {
        const message = getApiErrorMessage(err);
        addToast(message, "error");
        if (mountedRef.current) {
          setUser(session.user ?? null); // fallback to session user or null
        }
        console.warn("Failed to load user data:", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    getUserData();
    return () => {
      mountedRef.current = false;
      hasFetchedRef.current = false;
    };
  }, [session, status, addToast]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
