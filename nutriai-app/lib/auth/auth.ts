import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/infrastructure/database/mongodb";
import User from "@/models/User";
import { LoginSchema } from "@/lib/validations";

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

        await connectDB();
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted ?? false,
          provider: user.provider || "credentials",
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const { name, email, image } = user;
        if (!email) return false;

        try {
          await connectDB();
          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            dbUser = await User.create({
              name: name || "Google User",
              email: email,
              image: image || undefined,
              provider: "google",
              googleId: profile?.sub || account.providerAccountId,
              onboardingCompleted: false,
            });
          } else {
            let updated = false;
            if (!dbUser.provider || dbUser.provider !== "google") {
              dbUser.provider = "google";
              dbUser.googleId = (profile?.sub || account.providerAccountId) as string;
              updated = true;
            }
            if (image && !dbUser.image) {
              dbUser.image = image;
              updated = true;
            }
            if (updated) {
              await dbUser.save();
            }
          }

          // Populate user fields so they are available in JWT callback
          user.id = dbUser._id.toString();
          user.onboardingCompleted = dbUser.onboardingCompleted ?? false;
          (user as any).provider = dbUser.provider;
          user.image = dbUser.image;
          
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
  },
});
