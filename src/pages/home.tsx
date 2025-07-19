import { useState } from 'react';
import { CalculatorIcon, RulerIcon, WeightIcon } from 'lucide-react';

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'Underweight':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Normal':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'Overweight':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Obese':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');

  const calculateBMI = () => {
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    if (heightInMeters > 0 && weightInKg > 0) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(parseFloat(bmiValue.toFixed(2)));
      determineBMICategory(bmiValue);
    }
  };

  const determineBMICategory = (bmi: number) => {
    if (bmi < 18.5) setCategory('Underweight');
    else if (bmi >= 18.5 && bmi < 24.9) setCategory('Normal');
    else if (bmi >= 25 && bmi < 29.9) setCategory('Overweight');
    else setCategory('Obese');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-indigo-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-indigo-600">BMI Calculator</h2>
          <p className="text-sm text-gray-500">Know your body mass index instantly</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <div className="flex items-center border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-indigo-50 px-3 py-2 text-indigo-600">
                <RulerIcon className="w-5 h-5" />
              </div>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter height"
                className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <div className="flex items-center border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-indigo-50 px-3 py-2 text-indigo-600">
                <WeightIcon className="w-5 h-5" />
              </div>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
                className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <button
            onClick={calculateBMI}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            <CalculatorIcon className="w-5 h-5" />
            Calculate BMI
          </button>

          {bmi !== null && (
            <div className="mt-6 p-5 rounded-xl bg-indigo-50 text-center border border-indigo-200 shadow-sm">
              <p className="text-lg font-semibold text-gray-800">
                Your BMI: <span className="text-indigo-600 text-2xl">{bmi}</span>
              </p>
              <div className="text-sm text-gray-700 mt-2">
                Category:{' '}
                <span
                  className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${getCategoryBadgeColor(
                    category
                  )}`}
                >
                  {category}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
