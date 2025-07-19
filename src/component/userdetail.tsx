import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "../axios/axiosinstance";
import clsx from "clsx";
import { getCookie } from "../utils/commonfunc/cookie";

const reduxUser = {
  _id: "user123",
  role: "User", // Change to "Admin" for admin privileges
};

type Role = "Admin" | "User";

type UserDetailsForm = {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  dietaryPreferences: string;
  healthGoals: string;
};

const validationSchema = yup.object({
  age: yup.number().min(18).max(100).required("Age is required"),
  gender: yup.string().oneOf(["Male", "Female", "Other"]).required("Gender is required"),
  height: yup.number().min(50).max(300).required("Height is required"),
  weight: yup.number().min(1).max(500).required("Weight is required"),
  activityLevel: yup.string().required("Activity level is required"),
  dietaryPreferences: yup.string().required("Dietary preferences are required"),
  healthGoals: yup.string().required("Health goals are required"),
});

export default function UserDetailsPage() {
  const [userDetails, setUserDetails] = useState<UserDetailsForm | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [role] = useState<Role>(reduxUser.role);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserDetailsForm>({
    resolver: yupResolver(validationSchema),
  });

  const height = watch("height");
  const weight = watch("weight");

  const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : "";
  const getBmiCategory = (b: number) => {
    if (b < 18.5) return "Underweight";
    if (b < 25) return "Normal";
    if (b < 30) return "Overweight";
    return "Obese";
  };
 const _id = getCookie("userId")
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/user/get-userdetails/${_id}`);
      console.log("res for get user details",res)
      if (res.data?.data) {
        setUserDetails(res.data.data);
        reset(res.data.data);
        setIsNew(false);
      } else {
        setIsNew(true);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setIsNew(true);
      } else {
        setErrorMsg("Failed to load user details.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit: SubmitHandler<UserDetailsForm> = async (data) => {
    try {
      setLoading(true);
      setErrorMsg("");

      const url = !isNew ? `/api/user/update-UserDetails/${_id}` : `/api/user/create-UserDetails`  ;
      const method = isNew ? "post" : "post";

      const res = await api[method](url, {
        ...data,
        userId: reduxUser._id,
      });

      setUserDetails(res.data.data);
      setShowModal(false);
      setIsNew(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || "Failed to save user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Details</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded shadow"
        >
          {userDetails ? "Update" : "Add"} Details
        </button>
      </div>

      {userDetails ? (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p><strong>Age:</strong> {userDetails.age}</p>
            <p><strong>Gender:</strong> {userDetails.gender}</p>
            <p><strong>Height:</strong> {userDetails.height} cm</p>
            <p><strong>Weight:</strong> {userDetails.weight} kg</p>
          </div>
          <div className="space-y-2">
            <p><strong>Activity Level:</strong> {userDetails.activityLevel}</p>
            <p><strong>Dietary Preferences:</strong> {userDetails.dietaryPreferences}</p>
            <p><strong>Health Goals:</strong> {userDetails.healthGoals}</p>
            <p><strong>BMI:</strong> {bmi} ({getBmiCategory(parseFloat(bmi))})</p>
          </div>
        </div>
      ) : loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <p className="text-gray-500">No user details found.</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-lg w-full max-w-xl relative">
            <h2 className="text-2xl font-semibold mb-6">
              {isNew ? "Add" : "Edit"} User Details
            </h2>

            {errorMsg && (
              <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  {...register("age")}
                 // disabled={role !== "Admin"}
                  className={clsx(
                    "w-full border rounded px-3 py-2",
                    errors.age ? "border-red-500" : "border-gray-300"
                  )}
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className={clsx(
                    "w-full border rounded px-3 py-2",
                    errors.gender ? "border-red-500" : "border-gray-300"
                  )}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>

              {/* Other Fields */}
              {["height", "weight", "activityLevel", "dietaryPreferences", "healthGoals"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize text-gray-700 mb-1">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type={["height", "weight"].includes(field) ? "number" : "text"}
                    {...register(field as keyof UserDetailsForm)}
                    className={clsx(
                      "w-full border rounded px-3 py-2",
                      errors[field as keyof UserDetailsForm] ? "border-red-500" : "border-gray-300"
                    )}
                  />
                  {errors[field as keyof UserDetailsForm] && (
                    <p className="text-red-500 text-sm mt-1">
                      {(errors[field as keyof UserDetailsForm] as any)?.message}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
