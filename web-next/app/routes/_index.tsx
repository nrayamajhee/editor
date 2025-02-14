import { RedirectToSignIn, useUser } from "@clerk/remix";
import { createClerkClient } from "@clerk/remix/api.server";
import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { redirect, useNavigate } from "@remix-run/react";
import { LoaderFunction, useLoaderData } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (userId) {
    const user = await createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    }).users.getUser(userId);
    return redirect(`/${user.username}/documents`);
  }
  return userId;
}

export default function Index() {
  const userId = useLoaderData();
  if (!userId) {
    return <RedirectToSignIn />;
  }
}
