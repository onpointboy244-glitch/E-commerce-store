import { useState } from "react";
import { LoginForm } from "../components/Auth/LoginForm";
import { SignupForm } from "../components/Auth/SignupForm";

export function User() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <title>{isLogin ? "Login" : "SignUp"}</title>

      <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5 auth-wrapper">
        <LoginForm isActive={isLogin} onSwitch={() => setIsLogin(false)} />
        <SignupForm isActive={!isLogin} onSwitch={() => setIsLogin(true)} />
      </div>
    </>
  );
}
