import { useUpdateProfile } from "../../Hooks/useUpdateProfile";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "../../styles/profile.css";

const profileSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .regex(
      /^[a-zA-Z؀-ۿ]{2,}\s+[a-zA-Z؀-ۿ\s]{2,}$/,
      "Please enter at least two names separated by a space",
    ),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(
      /^(07[789]\d{7})$/,
      "Must be a valid Jordanian phone number (e.g. 079XXXXXXX)",
    ),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .regex(
      /^(amman|irbid|zarqa|zarga|aqaba|madaba|salt|jarash|ajloun|mafraq|ma'an|tafilah|karak|maan)$/i,
      "Must be a valid Jordanian city",
    ),
  street: z.string().trim().min(1, "Street is required"),
  building_number: z
    .string()
    .trim()
    .min(1, "Building number is required")
    .regex(/^[\d٠-٩]+$/, "Must contain only digits"),
});

export function EditProfile({ onClose, profile }) {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["user"]);
  const {
    mutate: updateProfile,
    isPending,
    error: updateProfileError,
  } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: profile?.fullname || "",
      phone: profile?.phone || "",
      city: profile?.address?.city || "",
      street: profile?.address?.street || profile?.address?.Street || "",
      building_number:
        profile?.address?.building_number ||
        profile?.address?.Bulding_number ||
        "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onValid = (data) => {
    const newProfileData = {
      fullname: data.fullname,
      phone: data.phone,
      address: {
        city: data.city,
        street: data.street,
        building_number: data.building_number,
      },
    };

    updateProfile(
      { newProfileData, user },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return createPortal(
    // شلنا (fade) عشان نضمن الظهور الفوري بدون تداخل مع (أنيميشن) (بوتستراب)
    <div
      className="modal show d-block"
      id="edit-profile-modal"
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", opacity: 1 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Edit Profile</h5>
            <button
              type="button"
              className="btn-close shadow-none"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit(onValid)}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">
                  Full Name
                </label>
                <input
                  type="text"
                  className={`form-control rounded-3 ${errors.fullname ? "is-invalid" : ""}`}
                  {...register("fullname")}
                />
                {errors.fullname && (
                  <div className="invalid-feedback">{errors.fullname.message}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">
                  Phone Number
                </label>
                <input
                  type="text"
                  className={`form-control rounded-3 ${errors.phone ? "is-invalid" : ""}`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone.message}</div>
                )}
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary">
                    City
                  </label>
                  <input
                    type="text"
                    className={`form-control rounded-3 ${errors.city ? "is-invalid" : ""}`}
                    {...register("city")}
                  />
                  {errors.city && (
                    <div className="invalid-feedback">{errors.city.message}</div>
                  )}
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary">
                    Building Number
                  </label>
                  <input
                    type="text"
                    className={`form-control rounded-3 ${errors.building_number ? "is-invalid" : ""}`}
                    {...register("building_number")}
                  />
                  {errors.building_number && (
                    <div className="invalid-feedback">
                      {errors.building_number.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">
                  Street
                </label>
                <input
                  type="text"
                  className={`form-control rounded-3 ${errors.street ? "is-invalid" : ""}`}
                  {...register("street")}
                />
                {errors.street && (
                  <div className="invalid-feedback">{errors.street.message}</div>
                )}
              </div>
              <div className="text-danger small mb-3">
                {updateProfileError?.message}
              </div>

              <button
                id="save-profile-btn"
                className="btn btn-dark w-100 py-3 fw-bold rounded-3 shadow-sm"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
