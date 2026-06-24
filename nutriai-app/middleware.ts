import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/"];
const PROTECTED_ROUTES = ["/dashboard", "/upload", "/history", "/onboarding"];

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn) {
    const onboardingCompleted = (req.auth?.user as any)?.onboardingCompleted;

    if (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") {
      return NextResponse.redirect(
        new URL(onboardingCompleted ? "/dashboard" : "/onboarding", req.url)
      );
    }

    if (nextUrl.pathname === "/onboarding" && onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (isProtectedRoute && nextUrl.pathname !== "/onboarding" && !onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
