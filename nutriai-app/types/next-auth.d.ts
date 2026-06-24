import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingCompleted?: boolean;
      provider?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    onboardingCompleted?: boolean;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    onboardingCompleted?: boolean;
    provider?: string;
  }
}
