import axios from "axios";

const GEMINI_API_URL =
  import.meta.env.VITE_GEMINI_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Use your Gemini API key from Google AI Studio
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Request queue to prevent multiple simultaneous requests
let isRequestInProgress = false;
const requestQueue = [];

// Generic function to make requests to Gemini API with retry logic
export const queueApiRequest = async (requestData, retries = 3) => {
  // If a request is already in progress, wait for it to complete
  if (isRequestInProgress) {
    return new Promise((resolve, reject) => {
      requestQueue.push({ requestData, retries, resolve, reject });
    });
  }

  isRequestInProgress = true;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      return response;
    } catch (error) {
      console.error(`API request attempt ${attempt} failed:`, error.response?.data || error);
      
      // If it's a rate limit error (429), wait before retrying
      if (error.response?.status === 429 && attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 10000; // Exponential backoff: 20s, 40s, 80s
        console.log(`Rate limit hit. Waiting ${waitTime/1000}s before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // If it's the last attempt or not a rate limit error, throw
      if (attempt === retries) {
        isRequestInProgress = false;
        processNextRequest();
        throw error;
      }
    }
  }
  
  isRequestInProgress = false;
  processNextRequest();
};

// Process next request in queue
const processNextRequest = () => {
  if (requestQueue.length > 0) {
    const { requestData, retries, resolve, reject } = requestQueue.shift();
    queueApiRequest(requestData, retries).then(resolve).catch(reject);
  }
};

export const generateQuestions = async (category) => {
  try {
    console.log('Starting question generation...');
    
    // Add a small delay before making the request to avoid rapid successive calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await queueApiRequest({
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
    });

    console.log('Received response from AI service');
    
    if (!response?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from AI service');
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    console.log('AI Response:', aiResponse);
    
    // Extract JSON from markdown code blocks if present
    let jsonText = aiResponse;
    if (aiResponse.includes('```json')) {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }
    
    console.log('Extracted JSON:', jsonText);
    
    const questionsData = JSON.parse(jsonText); // Array of 6 questions
    
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error('Invalid questions format received from AI');
    }

    const mappedQuestions = questionsData.map((q) => ({
      text: q.text,
      difficulty: q.difficulty,
      category: q.category,
      expectedTopics: q.expectedTopics || []
    }));
    
    console.log('Successfully generated questions:', mappedQuestions.length);
    return mappedQuestions;
  } catch (error) {
    console.error("Error generating questions:", error);
    
    // Provide more helpful error message for rate limits
    if (error.response?.status === 429) {
      throw new Error("API rate limit exceeded. Please wait a few minutes and try again.");
    }
    
    if (error.message.includes('timeout')) {
      throw new Error("Request timed out. Please try again.");
    }
    
    if (error.message.includes('Invalid')) {
      throw new Error("Invalid response from AI service. Please try again.");
    }
    
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};


export const evaluateAnswer = async (question, answer, candidateBackground) => {
  try {
    const response = await queueApiRequest({
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
    });

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

    const response = await queueApiRequest({
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
    });

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
