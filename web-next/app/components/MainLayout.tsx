import { useNavigation } from "@remix-run/react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useNavigation();
  return (
    <div className="mx-auto max-w-[960px] py-8 px-4 md:px-6 flex flex-col min-h-screen">
      {state === "loading" ? <div>loading...</div> : children}
    </div>
  );
}
