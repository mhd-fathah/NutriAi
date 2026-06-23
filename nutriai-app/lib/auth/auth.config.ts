import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [], // Configured dynamically in auth.ts to avoid importing non-edge dependencies (mongoose, bcrypt) in middleware
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { onboardingCompleted?: boolean }).onboardingCompleted =
          token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
};
