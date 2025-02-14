import { User } from "@clerk/remix/ssr.server";
import { useNavigation } from "@remix-run/react";
import Loader from "./Loader";
import Spinner from "./Spinner";
import Header from "./Header";

export default function MainLayout({
  user,
  children,
}: {
  user: Promise<User>;
  children: React.ReactNode;
}) {
  const { state } = useNavigation();
  return (
    <div className="mx-auto max-w-[960px] py-8 px-4 md:px-6 flex flex-col min-h-screen">
      {state === "loading" ? (
        <div>loading...</div>
      ) : (
        <>
          <Loader scaffold={<Spinner />} promise={user}>
            {(user: User) => <Header user={user} />}
          </Loader>
          <main>{children}</main>
        </>
      )}
    </div>
  );
}
