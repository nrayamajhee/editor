import { getAuth } from "@clerk/react-router/server";
import { Link, Outlet, redirect, useLoaderData } from "react-router";
import Profile from "~/components/Profile";
import type { Route } from "../+types/root";
import Weather from "~/components/Weather";
import { clerkClientContext } from "~/middleware/clerk-client-middleware";

const linkStyle = `
  py-4 px-4 border-b-4 border-b-sky-400/20 outline-none
  active:border-b-sky-400/50 focus:border-b-sky-400/50 hover:border-b-sky-400/50
  transition-colors
`;

export async function loader(args: Route.LoaderArgs) {
  const { userId, getToken } = await getAuth(args);
  const token = await getToken();
  if (!token || !userId) {
    throw redirect("/");
  }

  const clerkClient = args.context.get(clerkClientContext);
  const user = await clerkClient?.users.getUser(userId);
  if (!user) {
    throw redirect("/");
  }
  return { user };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-[960px] p-4 md:p-6 flex flex-col min-h-screen">
      <header className="flex flex-col gap-8">
        <div className="flex justify-between px-16">
          <Weather />
          <Profile variant="big" user={user} />
        </div>
        <nav className="flex gap-1 mx-6 md:mx-8 ">
          <Link className={linkStyle} to={`${user.username}/notes`}>
            Notes
          </Link>
          <Link className={linkStyle} to={`${user.username}/photos`}>
            Photos
          </Link>
          <Link className={linkStyle} to={`${user.username}/finance`}>
            Finance
          </Link>
        </nav>
      </header>
      <main className="border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700">
        <Outlet />
      </main>
    </div>
  );
}
