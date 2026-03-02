import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const APTITUDE_SECTIONS = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Data Interpretation",
  "Full Mock Test"
];

export const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer"
];

export const MOCK_QUESTIONS: Record<string, any[]> = {
  "Quantitative Aptitude": [
    {
      id: 1,
      text: "A train 150m long is running at a speed of 54 km/hr. How much time will it take to cross a platform 250m long?",
      options: ["20 seconds", "26.66 seconds", "30 seconds", "25 seconds"],
      correct: 1,
      explanation: "Total distance = 150 + 250 = 400m. Speed = 54 * 5/18 = 15 m/s. Time = 400/15 = 26.66s"
    },
    {
      id: 2,
      text: "The average of 5 numbers is 27. If one number is excluded, the average becomes 25. The excluded number is:",
      options: ["35", "45", "25", "30"],
      correct: 0,
      explanation: "Sum of 5 numbers = 5 * 27 = 135. Sum of 4 numbers = 4 * 25 = 100. Excluded number = 135 - 100 = 35."
    }
  ],
  "Logical Reasoning": [
    {
      id: 3,
      text: "If 'WATER' is written as 'YCVGT', then 'H2O' would be written as?",
      options: ["J4Q", "I3P", "K5R", "L6S"],
      correct: 0,
      explanation: "Each letter is shifted by 2. H+2=J, 2+2=4, O+2=Q."
    }
  ],
  "Verbal Ability": [
    {
      id: 4,
      text: "Choose the word that is most nearly opposite in meaning to 'ABUNDANT'.",
      options: ["Plentiful", "Scarce", "Rich", "Bountiful"],
      correct: 1,
      explanation: "Abundant means existing in large quantities. Scarce means insufficient for the demand."
    }
  ],
  "Data Interpretation": [
    {
      id: 5,
      text: "If a company's revenue increased from $100M to $125M, what is the percentage increase?",
      options: ["20%", "25%", "30%", "15%"],
      correct: 1,
      explanation: "Increase = 125 - 100 = 25. Percentage = (25/100) * 100 = 25%."
    }
  ]
};
