import { useReducer } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUp } from "../../Hooks/useSignUp";
import { reducer } from "../../state/FormReducer";
import "../../styles/user.css";

const signupSchema = z
  .object({
    firstname: z
      .string()
      .min(2, "At least 2 characters")
      .regex(/^[a-zA-Z؀-ۿ\s]+$/, "Letters only"),
    lastname: z
      .string()
      .min(2, "At least 2 characters")
      .regex(/^[a-zA-Z؀-ۿ\s]+$/, "Letters only"),
    email: z
      .string()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"),
    phone: z
      .string()
      .regex(
        /^(07[789]\d{7})$/,
        "Enter a valid Jordanian phone (e.g. 0771234567)",
      ),
    city: z
      .string()
      .regex(
        /^(amman|irbid|zarqa|zarga|aqaba|madaba|salt|jarash|ajloun|mafraq|ma'an|tafilah|karak|maan)$/i,
        "Enter a valid Jordanian city",
      ),
    street: z.string().min(1, "Street is required"),
    building: z.string().regex(/^[\d٠-٩]+$/, "Numbers only"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SignupForm({ onSwitch, isActive }) {
  const [state, dispatch] = useReducer(reducer, {
    showPassword: false,
    showConfirmPassword: false,
    shake: false,
  });

  const { signUp, isSigningUp, verifyingEmail } = useSignUp(dispatch);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = (data) => {
    dispatch({ type: "SET_ERROR", payload: "" });
    signUp({
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      city: data.city,
      street: data.street,
      building: data.building,
    });
  };

  const onInvalid = () => {
    dispatch({
      type: "SET_ERROR",
      payload: "Please fix the highlighted fields",
    });
  };

  const isLoading = isSigningUp;

  return (
    <form
      method="post"
      className="signup-form"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
    >
      <div
        className={`card signup-card border-0 shadow-lg p-4 p-md-5 ${isActive ? "show" : "hide"} ${state.shake ? "shake" : ""}`}
      >
        <h2 className="text-center fw-bold mb-2">CREATE AN ACCOUNT</h2>
        <p className="text-center text-muted mb-4">
          Join us today to enjoy the finest homemade dishes
        </p>

        {/* ---- Name row ---- */}
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="text"
                id="firstname"
                className={`form-control ${errors.firstname ? "is-invalid" : ""}`}
                placeholder="First Name"
                required
                {...register("firstname")}
              />
              <label htmlFor="firstname">First name</label>
              {errors.firstname && (
                <div className="invalid-feedback d-block">
                  {errors.firstname.message}
                </div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="text"
                id="lastname"
                className={`form-control ${errors.lastname ? "is-invalid" : ""}`}
                placeholder="Last Name"
                required
                {...register("lastname")}
              />
              <label htmlFor="lastname">Last name</label>
              {errors.lastname && (
                <div className="invalid-feedback d-block">
                  {errors.lastname.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Email ---- */}
        <div className="form-floating mb-3">
          <input
            type="email"
            id="signup-email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Email"
            required
            {...register("email")}
          />
          <label htmlFor="signup-email">Email Address</label>
          {errors.email && (
            <div className="invalid-feedback d-block">
              {errors.email.message}
            </div>
          )}
        </div>

        {/* ---- Phone ---- */}
        <div className="form-floating mb-3">
          <input
            type="tel"
            id="tel"
            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
            placeholder="+962"
            required
            {...register("phone")}
          />
          <label htmlFor="tel">Phone Number</label>
          {errors.phone && (
            <div className="invalid-feedback d-block">
              {errors.phone.message}
            </div>
          )}
        </div>

        {/* ---- Address ---- */}
        <div className="address p-3 bg-light rounded-3 mb-3">
          <p className="small fw-bold text-danger mb-2 text-uppercase">
            Address Details
          </p>
          <div className="row g-2">
            <div className="col-6">
              <div className="form-floating">
                <input
                  type="text"
                  id="city"
                  className={`form-control ${errors.city ? "is-invalid" : ""}`}
                  placeholder="City"
                  required
                  {...register("city")}
                />
                <label htmlFor="city">City</label>
                {errors.city && (
                  <div className="invalid-feedback d-block">
                    {errors.city.message}
                  </div>
                )}
              </div>
            </div>
            <div className="col-6">
              <div className="form-floating">
                <input
                  type="text"
                  id="bulding"
                  className={`form-control ${errors.building ? "is-invalid" : ""}`}
                  placeholder="Building"
                  required
                  {...register("building")}
                />
                <label htmlFor="bulding">Building No.</label>
                {errors.building && (
                  <div className="invalid-feedback d-block">
                    {errors.building.message}
                  </div>
                )}
              </div>
            </div>
            <div className="col-12">
              <div className="form-floating">
                <input
                  type="text"
                  id="street"
                  className={`form-control ${errors.street ? "is-invalid" : ""}`}
                  placeholder="Street"
                  required
                  {...register("street")}
                />
                <label htmlFor="street">Street</label>
                {errors.street && (
                  <div className="invalid-feedback d-block">
                    {errors.street.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Passwords ---- */}
        <div className="password-section-signup">
          <div className="mb-1">
            <div className="form-floating position-relative">
              <input
                type={state.showPassword ? "text" : "password"}
                id="signup-password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="Password"
                required
                {...register("password")}
              />
              <label htmlFor="signup-password">Password</label>
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

          <div className="mb-3">
            <div className="form-floating position-relative">
              <input
                type={state.showConfirmPassword ? "text" : "password"}
                id="signup-confirm-password"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                placeholder="Confirm Password"
                required
                {...register("confirmPassword")}
              />
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <span
                className="toggle-password position-absolute end-0 top-50 translate-middle-y me-3"
                onClick={() => dispatch({ type: "TOGGLE_CONFIRM_PASSWORD" })}
                style={{ cursor: "pointer", zIndex: 10 }}
              >
                <i
                  className={`bi ${state.showConfirmPassword ? "bi-eye" : "bi-eye-slash"}`}
                  style={{ fontSize: "1.2rem" }}
                ></i>
              </span>
            </div>
            {errors.confirmPassword && (
              <div className="text-danger small mt-1">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>

          <small className="text-muted d-block mb-2">
            You can use letters, numbers & periods
          </small>

          {/* API error alert — from the hook (Firebase / server errors) */}
          {state.error && (
            <span
              className={`error alert alert-danger p-2 small w-100 ${state.error ? "visible" : ""}`}
            >
              {state.error}
            </span>
          )}
          {verifyingEmail && (
            <div className="alert alert-info p-2 small w-100 mt-2">
              <strong>Check your email!</strong> We sent a verification link — please click it to complete registration.
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span
            onClick={() => {
              onSwitch();
              window.scrollTo(0, 0);
            }}
            className="go-to-login text-danger fw-bold small cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            Already have an account
          </span>
          <button
            type="submit"
            className="btn btn-brand px-4 py-2 fw-bold shadow-sm next-btn"
            id="signup"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            {verifyingEmail ? "VERIFYING..." : isLoading ? "CREATING..." : "NEXT"}
          </button>
        </div>
      </div>
    </form>
  );
}
