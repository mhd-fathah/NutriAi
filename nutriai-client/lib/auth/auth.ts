import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { LoginSchema } from "@/lib/validations";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validated = LoginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;

        try {
          const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) return null;

          const result = await response.json();
          if (result && result.success && result.data) {
            return {
              id: result.data.user.id,
              name: result.data.user.name,
              email: result.data.user.email,
              onboardingCompleted: result.data.user.onboardingCompleted ?? false,
              provider: "credentials",
              accessToken: result.data.token,
            };
          }
        } catch (error) {
          console.error("Auth error in Credentials authorize:", error);
        }

        return null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const googleToken = account.id_token || account.access_token;
        if (!googleToken) return false;

        try {
          const response = await fetch(`${BACKEND_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: googleToken }),
          });

          if (!response.ok) return false;

          const result = await response.json();
          if (result && result.success && result.data) {
            user.id = result.data.user.id;
            user.name = result.data.user.name;
            user.email = result.data.user.email;
            user.image = result.data.user.image;
            (user as any).onboardingCompleted = result.data.user.onboardingCompleted ?? false;
            (user as any).provider = "google";
            (user as any).accessToken = result.data.token;
            return true;
          }
        } catch (error) {
          console.error("Error in signIn google callback:", error);
          return false;
        }
      }
      return true;
    },
  },
});
