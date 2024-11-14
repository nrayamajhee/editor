import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Wrapper() {
  return (
    <div className="bg-zinc-900 text-zinc-50">
      <div className="mx-auto max-w-[960px] p-8 flex flex-col min-h-screen">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}
