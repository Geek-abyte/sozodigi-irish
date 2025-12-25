import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

// Use NEXT_PUBLIC_NODE_API_BASE_URL if set, otherwise fall back to NEXT_PUBLIC_NODE_BASE_URL
// Both should point to the same backend API URL
const API_BASE_URL = 
  process.env.NEXT_PUBLIC_NODE_API_BASE_URL || 
  process.env.NEXT_PUBLIC_NODE_BASE_URL;

if (!API_BASE_URL) {
  console.error("❌ Neither NEXT_PUBLIC_NODE_API_BASE_URL nor NEXT_PUBLIC_NODE_BASE_URL is set! Login will not work.");
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!API_BASE_URL) {
            throw new Error("API URL is not configured. Please set NEXT_PUBLIC_NODE_API_BASE_URL.");
          }

          const res = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              token: credentials.token, // optional
            }),
          });

          if (!res.ok) {
            // Try to get error message from response
            let errorMessage = "Invalid credentials";
            try {
              const errorData = await res.text();
              // If it's JSON, parse it
              try {
                const jsonError = JSON.parse(errorData);
                errorMessage = jsonError.message || errorMessage;
              } catch {
                // If not JSON, use the text
                errorMessage = errorData || errorMessage;
              }
            } catch {
              // If we can't read the response, use default message
            }
            throw new Error(errorMessage);
          }

          const user = await res.json();

          if (!user.token) throw new Error("No token returned");

          return { ...user };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  // 👇 Add this block here
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 minute for quick testing, adjust as needed
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.user._id;
        token.jwt = user.token;
        token.email = user.user.email;
        token.role = user.user.role;
        token.name = user.user.name;
        token.isProfileComplete = user.user.isProfileComplete ?? false;
        // token.isHealthQuestionsAnswered = user.user.isHealthQuestionsAnswered ?? false;
        token.approvalStatus = user.user.approvalStatus ?? "pending";

        try {
          const decoded = jwtDecode(user.token);
          token.exp = decoded.exp;
        } catch (e) {
          console.error("Failed to decode JWT:", e);
          token.exp = null;
        }
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (token?.exp && token.exp < currentTime) {
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.jwt = token.jwt;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.isProfileComplete = token.isProfileComplete ?? false;
        session.user.approvalStatus = token.approvalStatus ?? "pending";
        session.error = token.error ?? null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});
