import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth/login", "/auth/register"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/panel")) {
    if (!request.cookies.get("token")) {
      return NextResponse.redirect(
        new URL("/auth/login?message=请先登录", request.url),
      );
    }
  }
  return NextResponse.next();
}
