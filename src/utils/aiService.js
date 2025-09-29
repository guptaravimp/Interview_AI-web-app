import axios from "axios";

const GEMINI_API_URL =
  import.meta.env.VITE_GEMINI_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Use your Gemini API key from Google AI Studio
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Rate limiting configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 30000; // 30 seconds
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

// Request queue to manage concurrent calls
let requestQueue = [];
let isProcessingQueue = false;

/**
 * Sleep utility function
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt) => {
  const delay = BASE_DELAY * Math.pow(2, attempt);
  return Math.min(delay, MAX_DELAY);
};

/**
 * Make API request with retry logic and rate limiting
 */
const makeApiRequest = async (requestData, maxRetries = MAX_RETRIES) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add delay between requests to respect rate limits
      if (attempt > 0) {
        await sleep(RATE_LIMIT_DELAY);
      }
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      return response;
    } catch (error) {
      const isRateLimitError = error.response?.status === 429;
      const isServerError = error.response?.status >= 500;
      
      // If it's the last attempt or not a retryable error, throw
      if (attempt === maxRetries || (!isRateLimitError && !isServerError)) {
        throw error;
      }
      
      // Calculate delay for exponential backoff
      const delay = getRetryDelay(attempt);
      console.warn(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, error.response?.data || error.message);
      
      await sleep(delay);
    }
  }
};

/**
 * Queue management for API requests
 */
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { requestData, resolve, reject } = requestQueue.shift();
    
    try {
      const response = await makeApiRequest(requestData);
      resolve(response);
    } catch (error) {
      reject(error);
    }
    
    // Add delay between queue processing to prevent rate limiting
    if (requestQueue.length > 0) {
      await sleep(RATE_LIMIT_DELAY);
    }
  }
  
  isProcessingQueue = false;
};

/**
 * Add request to queue and process
 */
const queueApiRequest = (requestData) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ requestData, resolve, reject });
    processRequestQueue();
  });
};

/**
 * Generate 6 questions: 2 Easy, 2 Medium, 2 Hard
 * @param {string} category - Focus category (e.g., React/Node/SQL)
 */
export const generateQuestions = async (category) => {
  try {
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert technical interviewer. Generate 2 easy level interview questions for a full-stack developer position focusing on React and Node.js. Return each question as a JSON object in an array with structure: {"text": "The question", "difficulty": "easy", "category": "React/Node", "expectedTopics": ["topic1","topic2"]}.`
            },
            {
              text: `Generate 2 medium level interview questions for a full-stack developer position focusing on React and Node.js. Return each question as a JSON object in the same structure, difficulty: "medium".`
            },
            {
              text: `Generate 2 hard level interview questions for a full-stack developer position focusing on React and Node.js. Return each question as a JSON object in the same structure, difficulty: "hard".`
            }
          ]
        }
      ]
    };

    const response = await queueApiRequest(requestData);
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from markdown code blocks if present
    let jsonText = aiResponse;
    if (aiResponse.includes('```json')) {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }
    
    const questionsData = JSON.parse(jsonText); // Array of 6 questions

    return questionsData.map((q) => ({
      text: q.text,
      difficulty: q.difficulty,
      category: q.category,
      expectedTopics: q.expectedTopics || []
    }));
  } catch (error) {
    console.error("Error generating questions:", error.response?.data || error);
    throw new Error("Failed to generate questions with Gemini API.");
  }
};

/** 
 * Evaluate candidate's answer
 */
export const evaluateAnswer = async (question, answer, candidateBackground) => {
  try {
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert technical interviewer evaluating a candidate's answer.
                     Question: ${question.text}
                     Difficulty: ${question.difficulty}
                     Category: ${question.category}
                     Expected Topics: ${question.expectedTopics?.join(", ") || "N/A"}
                     
                     Evaluate the candidate's answer and return a JSON object:
                     {
                       "score": 85,
                       "feedback": "Detailed feedback about the answer",
                       "strengths": ["strength1", "strength2"],
                       "improvements": ["improvement1", "improvement2"]
                     }
                     Score should be 0-100. Provide constructive feedback.`
            },
            { text: `Candidate's answer: ${answer}` }
          ]
        }
      ]
    };

    const response = await queueApiRequest(requestData);
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from markdown code blocks if present
    let jsonText = aiResponse;
    if (aiResponse.includes('```json')) {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }
    
    const evaluation = JSON.parse(jsonText);

    return {
      score: Math.max(0, Math.min(100, evaluation.score)),
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || []
    };
  } catch (error) {
    console.error("Error evaluating answer:", error.response?.data || error);
    throw new Error("Failed to evaluate answer with Gemini API.");
  }
};

/**
 * Generate interview summary
 */
export const generateInterviewSummary = async (candidate, questions, answers) => {
  try {
    const scores = answers.map((a) => a.score || 0).filter((s) => s > 0);
    const overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const questionsText = questions
      .map((q, i) => `${i + 1}. ${q.text} (${q.difficulty})`)
      .join("\n");
    const answersText = answers
      .map((a, i) => `${i + 1}. Score: ${a.score || 0}/100\n   Answer: ${a.answer}`)
      .join("\n\n");

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are an expert HR manager and technical interviewer. Generate a comprehensive interview summary for a candidate.
                       Return a JSON object:
                       {
                         "summary": "Detailed summary of the candidate's performance",
                         "overallScore": 85
                       }
                       Include:
                       - Overall performance assessment
                       - Key strengths and weaknesses
                       - Technical competency evaluation
                       - Recommendations for hiring decision
                       - Areas for improvement
                       Be professional, constructive, and specific.`
              },
              {
                text: `Candidate: ${candidate.name}
                       Email: ${candidate.email}
                       Background: ${candidate.background || "Not provided"}
                       
                       Questions asked:
                       ${questionsText}
                       
                       Candidate's answers:
                       ${answersText}
                       
                       Average score: ${overallScore}/100`
              }
            ]
          }
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from markdown code blocks if present
    let jsonText = aiResponse;
    if (aiResponse.includes('```json')) {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }
    
    const summaryData = JSON.parse(jsonText);

    return {
      summary: summaryData.summary,
      overallScore: Math.max(0, Math.min(100, summaryData.overallScore || overallScore))
    };
  } catch (error) {
    console.error("Error generating summary:", error.response?.data || error);
    throw new Error("Failed to generate interview summary with Gemini API.");
  }
};
