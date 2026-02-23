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
  const addToastRef = useRef(toast?.addToast);
  addToastRef.current = toast?.addToast;

  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(true);
  const lastUserIdRef = useRef(null);

  const userId = session?.user?.id;
  const token = session?.user?.jwt;

  useEffect(() => {
    mountedRef.current = true;

    if (status !== "authenticated" || !userId || !token) {
      setLoading(false);
      return;
    }

    if (hasFetchedRef.current && lastUserIdRef.current === userId) {
      setLoading(false);
      return;
    }
    hasFetchedRef.current = true;
    lastUserIdRef.current = userId;

    let cancelled = false;

    const getUserData = async () => {
      try {
        const fullUser = await fetchData("users/" + userId, token);

        if (cancelled || !mountedRef.current) return;

        if (fullUser) {
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
          setUser(session.user);
        }
      } catch (err) {
        if (cancelled || !mountedRef.current) return;
        const message = getApiErrorMessage(err);
        addToastRef.current?.(message, "error");
        setUser(session.user ?? null);
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false);
      }
    };

    getUserData();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [userId, token, status]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
