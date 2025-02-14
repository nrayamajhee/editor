import type { LoaderFunction, LinksFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { rootAuthLoader } from "@clerk/remix/ssr.server";

import "./tailwind.css";

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, () => {
    return { API_URL: process.env.API_URL };
  });
};

import { ClerkApp } from "@clerk/remix";
import { FiXOctagon } from "react-icons/fi";

export const links: LinksFunction = () => [
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
];

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const err = useRouteError();
  if (err) {
    console.error(err);
  }
  const error = err as { status: number } | undefined;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {error?.status === 404 ? <NotFound /> : children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.API_URL = "${data?.API_URL}"`,
          }}
        />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="w-full h-screen grid place-items-center">
      <div className="flex items-center flex-col gap-2">
        <FiXOctagon className="w-16 h-16 text-red-500" />
        <h1>404: Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-blue-200">
          Find your way home.
        </Link>
      </div>
    </div>
  );
}

function App() {
  return <Outlet />;
}
export default ClerkApp(App);
