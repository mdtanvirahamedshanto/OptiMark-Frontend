import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const backendBaseUrl = process.env.BACKEND_API_URL || "http://localhost:8000/v1";
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production"
    ? "dev-only-auth-secret-change-me"
    : undefined);

if (!authSecret) {
  throw new Error("Missing AUTH_SECRET/NEXTAUTH_SECRET");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google" && account.id_token) {
        console.log("NextAuth: Exchanging Google token with backend...");
        try {
          const res = await fetch(`${backendBaseUrl}/auth/oauth/google/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            console.log("NextAuth: Backend exchange successful", { hasToken: !!data?.access_token });
            token.backendAccessToken = data?.access_token;
            token.backendUser = data?.user;
          } else {
            const errBody = await res.text().catch(() => "unknown");
            console.error("NextAuth: Backend exchange failed", res.status, errBody);
            token.backendAccessToken = undefined;
            token.backendUser = undefined;
          }
        } catch (error) {
          console.error("NextAuth: Backend exchange threw an error", error);
          token.backendAccessToken = undefined;
          token.backendUser = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.backendAccessToken =
        typeof token.backendAccessToken === "string"
          ? token.backendAccessToken
          : undefined;
      session.backendUser =
        token.backendUser && typeof token.backendUser === "object"
          ? (token.backendUser as {
              id: number;
              email: string;
              role: string;
              profile_completed: boolean;
            })
          : undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
