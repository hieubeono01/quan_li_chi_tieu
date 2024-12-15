import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";
import { authConfig } from "../firebase/server-config";
import { logout } from "../api";

const PUBLIC_PATHS = ["/register", "/xac-thuc", "/xac-thuc-so-dien-thoai", "/", "/danh-sach-viec-lam", "/danh-sach-ung-vien", "/reset-password", "/short-link"];

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      // Authenticated user should not be able to access /login, /register and /reset-password routes
      if (["/xac-thuc", "/xac-thuc-so-dien-thoai"].includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }
      // headers.set('x-url', request.url);
      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleInvalidToken: async (reason) => {
      // headers.set('x-url', request.url);
      // console.info('Missing or malformed credentials', { reason });
      // await logout();
      const publicPaths = Object.assign([], PUBLIC_PATHS);
      if (request.nextUrl.pathname.startsWith("/dashboard/")) {
        publicPaths.push(request.nextUrl.pathname);
      }
      return redirectToLogin(request, {
        path: "/xac-thuc",
        publicPaths,
      });
    },
    handleError: async (error) => {
      await logout();
      // console.error("Unhandled authentication error");
      return redirectToLogin(request, {
        path: "/xac-thuc",
        publicPaths: PUBLIC_PATHS,
      });
    },
  });
}

export const config = {
  matcher: ["/", "/((?!_next|favicon.ico|api|.*\\.).*)", "/api/login", "/api/logout", "/danh-sach-viec-lam", "/viec-lam/(.*)", "/danh-sach-ung-vien"],
};
