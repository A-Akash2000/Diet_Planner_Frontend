import React from 'react';

interface NutritionalValues {
  calories: number;
  proteins: number;
}

interface Meal {
  mealId: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  suggestedMeals: string[];
  nutritionalValues: NutritionalValues;
}

interface DietPlan {
  _id: string;
  userId: string;
  period: 'Daily' | 'Weekly';
  meals: Meal[];
}

// Mock data
const mockDietPlans: DietPlan[] = [
  {
    _id: '1',
    userId: 'user123',
    period: 'Daily',
    meals: [
      {
        mealId: 'm1',
        mealType: 'Breakfast',
        suggestedMeals: ['Oatmeal', 'Banana', 'Boiled Egg'],
        nutritionalValues: { calories: 350, proteins: 15 },
      },
      {
        mealId: 'm2',
        mealType: 'Lunch',
        suggestedMeals: ['Grilled Chicken', 'Brown Rice', 'Salad'],
        nutritionalValues: { calories: 550, proteins: 30 },
      },
      {
        mealId: 'm3',
        mealType: 'Dinner',
        suggestedMeals: ['Fish', 'Steamed Vegetables', 'Quinoa'],
        nutritionalValues: { calories: 480, proteins: 28 },
      },
       {
        mealId: 'm4',
        mealType: 'Snack',
        suggestedMeals: ['Furits', 'Steamed Vegetables'],
        nutritionalValues: { calories: 480, proteins: 28 },
      },
    ],
  },
];

const DietPlanPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Diet Plan Overview</h1>

      {mockDietPlans.map((plan) => (
        <div
          key={plan._id}
          className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Diet Plan (Period: {plan.period})
            </h2>
            {/* <span className="text-sm text-gray-500">User ID: {plan.userId}</span> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.meals.map((meal) => (
              <div
                key={meal.mealId}
                className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition"
              >
                <h3 className="text-lg font-medium text-blue-600 mb-1">
                  {meal.mealType}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Suggestions:</span>{' '}
                  {meal.suggestedMeals.join(', ')}
                </p>
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Calories:</span>{' '}
                    {meal.nutritionalValues.calories} kcal
                  </p>
                  <p>
                    <span className="font-semibold">Proteins:</span>{' '}
                    {meal.nutritionalValues.proteins} g
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DietPlanPage;
