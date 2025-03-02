import { createClerkClient } from "@clerk/react-router/api.server";
import { getAuth, type User } from "@clerk/react-router/ssr.server";
import { Link, Outlet } from "react-router";
import Profile from "~/components/Profile";
import type { Route } from "../+types/root";
import Weather from "~/components/Weather";

const linkStyle = `
  py-4 px-4 border-b-4 border-b-sky-400/20 outline-none
  active:border-b-sky-400/50 focus:border-b-sky-400/50 hover:border-b-sky-400/50
  transition-colors
`;

export async function loader(args: Route.LoaderArgs) {
  const { userId, getToken } = await getAuth(args);
  const token = await getToken();
  if (!token || !userId) {
    throw new Error("Redirect to / without authorized user!");
  }

  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);

  return { user };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData as { user: User };
  return (
    <div className="mx-auto max-w-[960px] py-8 px-4 md:px-6 flex flex-col min-h-screen">
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
        </nav>
      </header>
      <main className="p-6 md:p-8 border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700">
        <Outlet />
      </main>
    </div>
  );
}
