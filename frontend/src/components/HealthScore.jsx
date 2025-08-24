import React, { useState, useEffect } from 'react';
import { HeartIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const HealthScore = ({ userEmail }) => {
  const [healthData, setHealthData] = useState({
    score: 0,
    grade: 'F',
    factors: {
      age: 0,
      bmi: 0,
      checkups: 0,
      medications: 0
    },
    recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateHealthScore();
  }, [userEmail]);

  const calculateHealthScore = async () => {
    try {
      // Simulate fetching user health data
      // In a real app, this would come from the backend
      const mockHealthData = {
        age: 28,
        recentCheckups: 2,
        activeMedications: 1,
        bmi: 22.5,
        lastCheckupDate: '2025-06-15'
      };

      // Calculate health score (0-100)
      let score = 100;
      const factors = {};

      // Age factor (0-25 points)
      if (mockHealthData.age < 30) {
        factors.age = 25;
      } else if (mockHealthData.age < 50) {
        factors.age = 20;
      } else if (mockHealthData.age < 65) {
        factors.age = 15;
      } else {
        factors.age = 10;
      }

      // BMI factor (0-25 points)
      if (mockHealthData.bmi >= 18.5 && mockHealthData.bmi <= 24.9) {
        factors.bmi = 25;
      } else if (mockHealthData.bmi >= 25 && mockHealthData.bmi <= 29.9) {
        factors.bmi = 15;
      } else {
        factors.bmi = 5;
      }

      // Recent checkups factor (0-30 points)
      if (mockHealthData.recentCheckups >= 2) {
        factors.checkups = 30;
      } else if (mockHealthData.recentCheckups === 1) {
        factors.checkups = 20;
      } else {
        factors.checkups = 0;
      }

      // Medication factor (0-20 points)
      if (mockHealthData.activeMedications === 0) {
        factors.medications = 20;
      } else if (mockHealthData.activeMedications <= 2) {
        factors.medications = 15;
      } else {
        factors.medications = 5;
      }

      score = factors.age + factors.bmi + factors.checkups + factors.medications;

      // Determine grade
      let grade;
      if (score >= 90) grade = 'A+';
      else if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 50) grade = 'D';
      else grade = 'F';

      // Generate recommendations
      const recommendations = [];
      if (factors.checkups < 20) {
        recommendations.push('Schedule regular health checkups');
      }
      if (factors.bmi < 20) {
        recommendations.push('Maintain a healthy BMI through diet and exercise');
      }
      if (factors.medications < 15) {
        recommendations.push('Review medications with your doctor');
      }
      if (score < 70) {
        recommendations.push('Consider lifestyle improvements for better health');
      }

      setHealthData({
        score,
        grade,
        factors,
        recommendations
      });
      setLoading(false);
    } catch (error) {
      console.error('Error calculating health score:', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A'].includes(grade)) return 'bg-green-100 text-green-800';
    if (['B', 'C'].includes(grade)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
          Health Score
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(healthData.grade)}`}>
          Grade {healthData.grade}
        </span>
      </div>

      {/* Score Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={healthData.score >= 80 ? '#10b981' : healthData.score >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${healthData.score * 3.14} 314`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(healthData.score)}`}>
              {healthData.score}
            </span>
          </div>
        </div>
      </div>

      {/* Health Factors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Age Factor</div>
          <div className="text-lg font-semibold text-gray-900">{healthData.factors.age}/25</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">BMI Factor</div>
          <div className="text-lg font-semibold text-gray-900">{healthData.factors.bmi}/25</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Checkups</div>
          <div className="text-lg font-semibold text-gray-900">{healthData.factors.checkups}/30</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Medications</div>
          <div className="text-lg font-semibold text-gray-900">{healthData.factors.medications}/20</div>
        </div>
      </div>

      {/* Recommendations */}
      {healthData.recommendations.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {healthData.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
            Book Checkup
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
            Health Tips
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthScore;
