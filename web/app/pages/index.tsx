import { redirect } from "react-router";
import { RedirectToSignIn, SignedOut } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/server";
import type { Route } from "./+types";
import { clerkClientContext } from "~/middleware/clerk-client-middleware";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return null;
  }
  const clerkClient = args.context.get(clerkClientContext);
  const user = await clerkClient?.users.getUser(userId);
  if (!user) {
    return null;
  }
  return redirect(`/${user.username}/notes`);
}

export default function Index() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
