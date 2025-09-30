import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { queueApiRequest } from "./aiService.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Extract text from PDF
export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
  }
  return fullText;
};

// Extract text from DOCX
export const extractTextFromDOCX = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

// Call Gemini API to parse resume text
const parseResumeTextWithGemini = async (text) => {
  try {
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `Extract the following information from this resume text and return ONLY a valid JSON object with no additional text:

{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "phone number (clean format like +91XXXXXXXXXX)",
  "skills": ["skill1", "skill2", "skill3"]
}

Instructions:
- For name: Extract ONLY the person's full name (first and last name), exclude any location, city, or country information
- For phone: Clean the phone number and format it properly (remove any special characters except +)
- For skills: Extract technical skills, programming languages, frameworks, and tools mentioned
- Example: If resume shows "John Doe New York, USA", extract only "John Doe"

Resume text:
${text}`
            }
          ]
        }
      ]
    };

    const response = await queueApiRequest(requestData);
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response (in case there's extra text)
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, try parsing the entire response
    return JSON.parse(aiResponse);
  } catch (error) {
    console.error("Error parsing resume with Gemini API:", error.response?.data || error);
    throw error; // Let the main function handle fallback
  }
};

// Fallback function to extract basic fields from text
const extractFieldsFromText = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  // Improved phone regex to handle various formats including international numbers
  const phoneRegex = /(\+?91[-.\s]?)?(\+?1[-.\s]?)?\(?([0-9]{3,4})\)?[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{4})/;
  
  const email = text.match(emailRegex)?.[0] || null;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, '').replace(/^\+?91/, '+91') : null;
  
  // Extract name from the beginning, clean up location info
  const lines = text.split('\n').filter(line => line.trim());
  let name = lines[0]?.trim() || null;
  
  // Clean up name - remove location info if present
  if (name) {
    // Remove multiple spaces and split by common separators
    name = name.replace(/\s+/g, ' ').trim();
    
    // Split by comma, pipe, or multiple spaces and take first part
    const nameParts = name.split(/[,|]\s*/);
    if (nameParts.length > 1) {
      name = nameParts[0].trim();
    }
    
    // If still has multiple words, check if it looks like "Name Location"
    const words = name.split(/\s+/);
    if (words.length > 2) {
      // Take only first two words (likely first and last name)
      name = words.slice(0, 2).join(' ');
    }
  }
  
  // Extract skills from common keywords
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'typescript',
    'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'aws', 'docker',
    'kubernetes', 'git', 'github', 'agile', 'scrum', 'api', 'rest', 'graphql',
    'express', 'spring boot', 'redux', 'next.js', 'tailwind', 'jwt', 'mern'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return { name, email, phone, skills: foundSkills };
};

// Main parseResume function
export const parseResume = async (file) => {
  try {
    let rawText;
    
    // Extract text from file
    if (file.type === "application/pdf") {
      rawText = await extractTextFromPDF(file);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    ) {
      rawText = await extractTextFromDOCX(file);
    } else {
      throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
    }

    // Try Gemini API first
    try {
      const extractedData = await parseResumeTextWithGemini(rawText);
      return {
        ...extractedData,
        rawText
      };
    } catch (aiError) {
      console.warn("Gemini API failed, using fallback extraction:", aiError);
      
      // Fallback to regex-based extraction
      const fallbackData = extractFieldsFromText(rawText);
      return {
        name: fallbackData.name || "Not found",
        email: fallbackData.email || "Not found",
        phone: fallbackData.phone || "Not found",
        skills: fallbackData.skills || [],
        rawText
      };
    }
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
