# 🥗 Personalized Diet Planner – Frontend

### 🚀 Built by: **Akash Swamy A**
### 📚 Batch: 6

---

## 📌 Project Overview

**Personalized Diet Planner** is a web application that helps users generate tailored diet plans based on their BMI and personal health goals. The frontend is developed using **React**, **TypeScript**, and **Tailwind CSS**, ensuring a smooth and responsive user experience.

---

## 🎯 Features Implemented

1. **User Registration & Profile Setup**
   - Input fields for age, gender, height, weight.
   - Activity level and dietary preferences.
   - Health goals: weight loss, gain, or maintenance.

2. **BMI Calculator**
   - Real-time BMI calculation.
   - Displays BMI category (Underweight, Normal, Overweight, Obese).

3. **Diet Plan Generator**
   - Generates daily/weekly meal plan.
   - Includes breakfast, lunch, dinner, and snacks.
   - Suggests meals based on BMI and goals.

4. **Nutritional Information**
   - Displays calories, proteins, carbs, and fats per meal.

5. **User Dashboard**
   - Tracks current diet plan.
   - Allows updates to personal metrics.

---

## 🗂️ Folder Structure

diet-planner-frontend/
│
├── public/ # Static files
│ └── index.html
│
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Route pages (Register, Dashboard, etc.)
│ ├── services/ # API calls using Axios or Fetch
│ ├── hooks/ # Custom hooks
│ ├── utils/ # Helper functions (e.g., BMI calculator)
│ ├── App.tsx # Main app file
│ ├── main.tsx # React DOM entry point
│ └── index.css # Tailwind imports
│
├── tailwind.config.ts # Tailwind configuration
├── tsconfig.json # TypeScript config
├── vite.config.ts # Vite build config
└── package.json


npm run dev --local