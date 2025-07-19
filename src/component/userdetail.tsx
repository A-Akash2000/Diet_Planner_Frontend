import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";

// Mocked Redux user
const reduxUser = {
  _id: "user123",
  age: 28,
  gender: "Male",
  height: 175,
  weight: 70,
  activityLevel: "Moderate",
  dietaryPreferences: "Vegan",
  healthGoals: "Maintenance",
  role: "User", // or "Admin"
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
  age: yup.number().min(18).max(100).required(),
  gender: yup.string().required(),
  height: yup.number().min(50).max(300).required(),
  weight: yup.number().min(1).max(500).required(),
  activityLevel: yup.string().required(),
  dietaryPreferences: yup.string().required(),
  healthGoals: yup.string().required(),
});

export default function UserDetailsPage() {
  const [userDetails, setUserDetails] = useState(reduxUser);
  const [showModal, setShowModal] = useState(false);
  const [role] = useState<Role>("User");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserDetailsForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      age: userDetails.age,
      gender: userDetails.gender,
      height: userDetails.height,
      weight: userDetails.weight,
      activityLevel: userDetails.activityLevel,
      dietaryPreferences: userDetails.dietaryPreferences,
      healthGoals: userDetails.healthGoals,
    },
  });

  const height = watch("height");
  const weight = watch("weight");

  const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : "";
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const handleFormSubmit: SubmitHandler<UserDetailsForm> = (data) => {
    console.log("Updated Data:", data);
    setUserDetails({ ...userDetails, ...data });
    setShowModal(false);
  };

  useEffect(() => {
    reset(userDetails);
  }, [userDetails]);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Details</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded shadow"
          >
            Update User Details
          </button>
        </div>
      </div>

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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50  flex items-center justify-center bg-black/100">
          <div className="bg-white p-8 rounded-lg w-full max-w-xl relative">
            <h2 className="text-2xl font-semibold mb-6">Edit User Details</h2>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {["age", "gender", "height", "weight", "activityLevel", "dietaryPreferences", "healthGoals"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize text-gray-700 mb-1">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type={["age", "height", "weight"].includes(field) ? "number" : "text"}
                    {...register(field as keyof UserDetailsForm)}
                    disabled={role !== "Admin" && ["age", "gender"].includes(field)}
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
                >
                  Save Changes
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
