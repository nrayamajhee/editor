import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Wrapper() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="mx-auto max-w-[960px] p-8 flex flex-col">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}
