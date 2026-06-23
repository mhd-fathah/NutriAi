import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/infrastructure/database/mongodb";
import User from "@/models/User";
import { LoginSchema } from "@/lib/validations";

export const {
  handlers,
  auth,
  signIn,
  signOut,
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
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted ?? false,
        };
      },
    }),
  ],
});
