import { Link } from "react-router-dom";
import { useReducer } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reducer } from "../../state/FormReducer";
import { useLogIn } from "../../Hooks/useLogIn";
import "../../styles/user.css";

const loginSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm({ onSwitch, isActive }) {
  const [state, dispatch] = useReducer(reducer, {
    showPassword: false,
    error: "",
    shake: false,
  });
  const { loginWithEmailAndPassword, loginWithGoogle, isLoggingIn } =
    useLogIn(dispatch);

  const isLoading = isLoggingIn;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onValid = (data) => {
    dispatch({ type: "SET_ERROR", payload: "" });
    loginWithEmailAndPassword({ email: data.email, password: data.password });
  };

  const onInvalid = () => {
    dispatch({
      type: "SET_ERROR",
      payload: "Please fix the highlighted fields",
    });
  };

  const handleGoogleLogin = () => {
    dispatch({ type: "SET_ERROR", payload: "" });
    loginWithGoogle();
  };

  return (
    <form method="post" className="login-form" onSubmit={handleSubmit(onValid, onInvalid)}>
      <div
        className={`card login-card border-0 shadow-lg p-4 p-md-5 ${isActive ? "show" : "hide"} ${state.shake ? "shake" : ""}`}
      >
        <h2 className="text-center fw-bold mb-2">Welcome Back!</h2>
        <p className="text-center text-muted mb-4">
          Log in to access your favorite flavors and orders
        </p>

        <div className="form-floating mb-3">
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            id="email"
            placeholder="Email"
            required
            {...register("email")}
          />
          <label htmlFor="email">Email Address</label>
          {errors.email && (
            <div className="invalid-feedback d-block">
              {errors.email.message}
            </div>
          )}
        </div>

        <div className="password-section-login mb-3">
          <div className="form-floating position-relative">
            <input
              type={state.showPassword ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              id="login-password"
              placeholder="Password"
              required
              {...register("password")}
            />
            <label htmlFor="login-password">Password</label>
            <span
              className="toggle-password position-absolute end-0 top-50 translate-middle-y me-3"
              onClick={() => dispatch({ type: "TOGGLE_PASSWORD" })}
              style={{ cursor: "pointer", zIndex: 10 }}
            >
              <i
                className={`bi ${state.showPassword ? "bi-eye" : "bi-eye-slash"}`}
                style={{ fontSize: "1.2rem" }}
              ></i>
            </span>
          </div>
          {errors.password && (
            <div className="text-danger small mt-1">
              {errors.password.message}
            </div>
          )}
        </div>

        <p
          className={`error-login alert alert-danger p-2 small text-center ${state.error ? "visible" : ""}`}
        >
          {state.error}{" "}
        </p>

        <Link
          to="#"
          className="forgot-password text-danger small fw-bold text-decoration-none d-block mb-4"
          id="forgot-password-link"
        >
          Forget password?
        </Link>

        <button
          type="button"
          className="btn btn-outline-dark w-100 mb-3 fw-bold shadow-sm"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <i className="bi bi-google me-2"></i> Sign in with Google
        </button>

        <div className="d-flex justify-content-between align-items-center">
          <span
            onClick={onSwitch}
            className="create-account go-to-signup text-danger fw-bold small cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            Don't have an account?
          </span>
          <button
            type="submit"
            className="btn btn-brand px-4 py-2 fw-bold shadow-sm next-btn"
            id="login"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </div>
      </div>
    </form>
  );
}
