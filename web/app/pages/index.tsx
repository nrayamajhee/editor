import { redirect } from "react-router";
import { RedirectToSignIn, SignedOut } from "@clerk/react-router";
import { createClerkClient } from "@clerk/react-router/api.server";
import { getAuth } from "@clerk/react-router/ssr.server";
import type { Route } from "./+types";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return null;
  }
  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);
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
