import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gharsadukan.com";
const MAIN_HOSTS = new Set([
  ROOT_DOMAIN,
  `www.${ROOT_DOMAIN}`,
  "localhost",
  "127.0.0.1",
]);

const getHostname = (request: NextRequest) => {
  const hostHeader =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const firstHost = hostHeader.split(",")[0]?.trim() || "";
  return firstHost.split(":")[0].toLowerCase();
};

const getSubdomain = (hostname: string) => {
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return hostname.slice(0, -(`.${ROOT_DOMAIN}`.length));
  }

  if (hostname.endsWith(".localhost")) {
    return hostname.slice(0, -".localhost".length);
  }

  return "";
};

export function proxy(request: NextRequest) {
  const hostname = getHostname(request);

  if (MAIN_HOSTS.has(hostname)) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(hostname);

  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  if (pathname === `/${subdomain}` || pathname.startsWith(`/${subdomain}/`)) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === "/" ? `/${subdomain}` : `/${subdomain}${pathname}`;

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
