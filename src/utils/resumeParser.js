import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Configure PDF.js worker
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
    const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent";
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Extract the following information from this resume text and return ONLY a valid JSON object with no additional text:

{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "phone number",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": "work experience summary"
}

Resume text:
${text}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

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
    
    // Fallback to basic text extraction if AI fails
    const fallbackData = extractFieldsFromText(text);
    return {
      name: fallbackData.name || "Not found",
      email: fallbackData.email || "Not found", 
      phone: fallbackData.phone || "Not found",
      skills: [],
      experience: "Not extracted"
    };
  }
};

// Main parseResume function
export const parseResume = async (file) => {
  try {
    let rawText;
    if (file.type === "application/pdf") {
      rawText = await extractTextFromPDF(file);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    ) {
      rawText = await extractTextFromDOCX(file);
    } else {
      throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
    }

    // Call Gemini API to extract structured data
    const extractedData = await parseResumeTextWithGemini(rawText);

    return {
      ...extractedData,
      rawText
    };
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
