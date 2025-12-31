"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "@/utils/api"; // 👈 import the util

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      if (status === "authenticated" && session?.user) {
        const userId = session.user.id;
        const token = session.user.jwt;

        console.log(userId)

        const fullUser = await fetchData('users/'+userId, token);

        if (fullUser) {
          // Ensure nested objects are safely handled
          // Extract address object properties to prevent rendering errors
          const safeUser = {
            ...fullUser,
            // Flatten address if it's an object to prevent React rendering errors
            address: fullUser.address && typeof fullUser.address === 'object' 
              ? `${fullUser.address.street || ''} ${fullUser.address.city || ''} ${fullUser.address.state || ''}`.trim() || null
              : fullUser.address,
            // Ensure country is a string, not nested
            country: fullUser.address?.country || fullUser.country || null,
          };
          setUser(safeUser);
        } else {
          setUser(session.user); // fallback to session user
        }
      }
      setLoading(false);
    };

    getUserData();
  }, [session, status]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
