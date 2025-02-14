import { getAuth } from "@clerk/remix/ssr.server";
import {
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import Spinner from "~/components/Spinner";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async (args) => {
  const user = await getAuth(args);
  if (user.userId) {
    return redirect(`${user.userId}/documents`);
  } else {
    return redirect("/login");
  }
};

export default function Index() {
  return (
    <div className="grid place-items-center min-h-screen">
      <Spinner />
    </div>
  );
}
