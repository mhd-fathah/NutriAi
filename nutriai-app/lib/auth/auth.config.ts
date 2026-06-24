import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [], // Configured dynamically in auth.ts to avoid importing non-edge dependencies (mongoose, bcrypt) in middleware
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted;
        token.provider = (user as { provider?: string }).provider || account?.provider;
        token.image = user.image;
      }
      if (trigger === "update" && session?.user) {
        token.onboardingCompleted = session.user.onboardingCompleted;
        if (session.user.image) token.image = session.user.image;
        if (session.user.name) token.name = session.user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { onboardingCompleted?: boolean }).onboardingCompleted =
          token.onboardingCompleted as boolean;
        (session.user as { provider?: string }).provider = token.provider as string;
        if (token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
  },
};
