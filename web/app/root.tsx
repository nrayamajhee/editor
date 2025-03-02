import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LayoutRouteProps,
} from "react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import { ClerkProvider } from "@clerk/react-router";
import { Toaster } from "react-hot-toast";

import type { Route } from "./+types/root";
import "./app.css";
import "./markdown.css";
import { FiXOctagon } from "react-icons/fi";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>",
  },
];

export function Layout({ children }: LayoutRouteProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args);
}

export default function App({
  loaderData,
}: {
  loaderData: Route.ComponentProps;
}) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <Outlet />
      <Toaster />
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 404;
  let message = "An unexpected error occurred.";
  let details: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || message;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    status = 500;
    message = error.message;
    details = error.stack;
  }

  return (
    <main className="max-w-[960px] mx-auto py-16 flex flex-col items-center gap-4">
      <FiXOctagon size={56} className="text-red-500" />
      <h1>{status}</h1>
      <p>{message}</p>
      {details && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{details}</code>
        </pre>
      )}
      {status === 404 && (
        <div>
          <a href="/" className="text-blue-500">
            Your way home
          </a>
        </div>
      )}
    </main>
  );
}
