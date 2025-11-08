import { Quiz } from '../types.ts';

const quizzes: Quiz[] = [
  {
    id: 'isro-001',
    title: 'ISRO\'s Major Achievements',
    subject: 'Science & Technology',
    difficulty: 'Easy',
    questions: [
      {
        text: 'What is the name of India\'s first satellite, launched in 1975?',
        options: [
          { text: 'Bhaskara', isCorrect: false },
          { text: 'Aryabhata', isCorrect: true },
          { text: 'Rohini', isCorrect: false },
          { text: 'Chandrayaan-1', isCorrect: false },
        ],
        explanation: 'Aryabhata was India\'s first-ever satellite, launched by the Soviet Union. It was named after the famous Indian astronomer and mathematician.'
      },
      {
        text: 'Which ISRO mission successfully reached Mars on its first attempt?',
        options: [
          { text: 'Chandrayaan-2', isCorrect: false },
          { text: 'Gaganyaan', isCorrect: false },
          { text: 'Mangalyaan (Mars Orbiter Mission)', isCorrect: true },
          { text: 'Aditya-L1', isCorrect: false },
        ],
        explanation: 'Mangalyaan made India the first nation to succeed on its maiden attempt to reach Mars and the fourth space agency in the world to do so. It was a landmark achievement in interplanetary exploration.'
      },
      {
        text: 'In 2017, ISRO set a world record by launching how many satellites in a single rocket?',
        options: [
          { text: '55', isCorrect: false },
          { text: '104', isCorrect: true },
          { text: '78', isCorrect: false },
          { text: '121', isCorrect: false },
        ],
        explanation: 'ISRO set a world record by launching 104 satellites on a single Polar Satellite Launch Vehicle (PSLV-C37). This demonstrated ISRO\'s capability for complex missions and commercial launch services.'
      },
    ],
  },
  {
    id: 'history-001',
    title: 'Modern Indian History',
    subject: 'History',
    difficulty: 'Medium',
    questions: [
        {
            text: 'The "Swadeshi" movement was a direct consequence of which event?',
            options: [
                { text: 'The Jallianwala Bagh massacre', isCorrect: false },
                { text: 'The Partition of Bengal in 1905', isCorrect: true },
                { text: 'The Non-Cooperation Movement', isCorrect: false },
                { text: 'The Salt March', isCorrect: false },
            ],
            explanation: 'The Partition of Bengal by Lord Curzon in 1905 sparked the Swadeshi movement, which promoted the use of Indian goods and the boycott of British products as a form of protest.'
        },
        {
            text: 'Who was the first Governor-General of independent India?',
            options: [
                { text: 'Jawaharlal Nehru', isCorrect: false },
                { text: 'Sardar Vallabhbhai Patel', isCorrect: false },
                { text: 'C. Rajagopalachari', isCorrect: false },
                { text: 'Lord Mountbatten', isCorrect: true },
            ],
            explanation: 'Lord Mountbatten, the last Viceroy of British India, was asked to continue as the first Governor-General of the Dominion of India after independence. C. Rajagopalachari was the last Governor-General and the only Indian to hold the post.'
        },
        {
            text: 'What was the primary objective of the "Quit India Movement" of 1942?',
            options: [
                { text: 'To demand Dominion status for India', isCorrect: false },
                { text: 'To protest against the Simon Commission', isCorrect: false },
                { text: 'To demand an end to British rule in India', isCorrect: true },
                { text: 'To start the civil disobedience movement', isCorrect: false },
            ],
            explanation: 'Launched by Mahatma Gandhi, the Quit India Movement was a call for immediate and complete independence, demanding an end to British rule in India during World War II.'
        }
    ]
  },
];


export const getQuizzes = (): Quiz[] => {
  return quizzes;
};

export const getQuizById = (id: string): Quiz | undefined => {
  return quizzes.find(q => q.id === id);
}
