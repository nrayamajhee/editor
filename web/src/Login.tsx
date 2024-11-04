import { SignIn, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user } = useUser();
  if (user) {
    return <Navigate to="/" />;
  }
  return (
    <div className="grid place-items-center min-h-screen">
      <SignIn forceRedirectUrl={import.meta.env.PROD ? "/editor" : undefined} />
    </div>
  );
}
