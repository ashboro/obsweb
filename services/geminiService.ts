
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface ScormFiles {
  'index.html': string;
  'imsmanifest.xml': string;
  'scorm_api_wrapper.js'?: string;
}

export async function generateWebsiteFromNotes(fileName: string, notesContent: string, assetFileNames: string[]): Promise<string> {
    const model = 'gemini-2.5-pro';

    const assetsInfo = assetFileNames.length > 0
        ? `
        **Available Image Assets:**
        The user has provided the following image assets: ${assetFileNames.join(', ')}.
        You should incorporate these images into the generated website where it makes sense to enhance the content.
        When you use an image, you MUST reference it using a relative path prefixed with 'assets/'.
        For example: <img src="assets/${assetFileNames[0] || 'example.png'}" alt="Descriptive text">
        Do NOT use any other paths for images.
        `
        : `No image assets were provided. Do not include any <img> tags unless you are using placeholder images from a service like unsplash.`;


    const prompt = `
        You are an expert front-end developer specializing in creating beautiful, interactive, and self-contained websites with Tailwind CSS and vanilla JavaScript.

        An Obsidian vault zip file named "${fileName}" has been uploaded. The user wants to convert this into a multi-page interactive website. The notes contain file paths (e.g., "study/Chapter1.md") which you should use to inform the site structure.

        Here is the combined content of all the markdown files from the user's notes:
        ---
        ${notesContent}
        ---
        
        ${assetsInfo}

        Your task is to generate a **complete, single, self-contained 'index.html' file** that simulates a multi-page experience **based on the provided notes**.

        **Core Requirements:**
        1.  **Content Relevance:** All generated content (page titles, text, quiz questions, images) MUST be directly based on the provided notes content and available assets. Do not make up information. If the notes are about "Quantum Physics", the website must be about "Quantum Physics".
        2.  **Single File Output:** The entire website (HTML, CSS, JS) must be in one single 'index.html' file. The final product will be zipped up with an 'assets' folder, but your output should ONLY be the HTML file.
        3.  **Tailwind CSS:** Use the Tailwind CSS CDN with the **typography plugin included**. Add \`<script src="https://cdn.tailwindcss.com?plugins=typography"></script>\` to the \`<head>\`.
        4.  **Multi-Page Simulation with JavaScript:**
            *   Create a structure with a persistent sidebar for navigation and a main content area.
            *   Create a logical navigation structure in the sidebar based on the file paths provided (e.g., 'study/Chapter1.md'). If you see subdirectories, consider creating nested menus or using headings in the sidebar to represent the vault's structure.
            *   Each "page" should be a \`<div class="page-content" id="page-name" style="display: none;"> ... </div>\`.
            *   The "Home" or first page should be visible by default (\`style="display: block;"\`).
            *   Write vanilla JavaScript to handle navigation. Clicking a link in the sidebar should hide all \`.page-content\` divs and then show only the one corresponding to the link's \`data-page\` attribute.
        5.  **Structure and Features:**
            *   **Sidebar Navigation:** Create links to "Home", other pages derived from the notes content, and a "Quiz".
            *   **Breadcrumbs:** The main content area must have a breadcrumb trail at the top that updates dynamically with JavaScript.
            *   **Home Page:** A hero section introducing the main topic of the notes.
            *   **Notes Pages:** Create distinct pages summarizing the key information from the provided notes. Use headings, paragraphs, lists, etc., appropriately. **If assets are available, display them here.**
            *   **Interactive Quiz Page:**
                *   Create a multiple-choice quiz with at least 4 questions whose answers can be found in the provided notes content.
                *   Include a "Submit Quiz" button and a script to check answers and display the score.
        6.  **Aesthetics & UX:**
            *   Use a modern, clean dark-mode design. Use a professional color palette.
            *   **Readable Content:** For the main content areas (the divs with class \`.page-content\`), wrap the rendered notes in a container with the Tailwind classes \`prose prose-invert max-w-none\`. This will ensure excellent readability with proper line spacing, margins, and font styling for headers, paragraphs, and lists.
            *   The layout must be fully responsive. The sidebar should be collapsible/overlay on mobile.
            *   Use smooth transitions and hover effects.
            *   Use a readable, modern font from Google Fonts.
        7.  **Output Format:** Provide ONLY the raw HTML code. Do not wrap it in markdown backticks or provide any explanations. The response must start with \`<!DOCTYPE html>\` and end with \`</html>\`.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        let text = response.text;

        // The AI can sometimes wrap its response in markdown code blocks.
        // This regex extracts the content from a ```html ... ``` block.
        const htmlBlockRegex = /```html\s*([\s\S]*?)\s*```/;
        const match = text.match(htmlBlockRegex);
        
        if (match && match[1]) {
            text = match[1];
        }

        text = text.trim();

        if (text.startsWith('<!DOCTYPE html>')) {
             return text;
        } else {
            // As a fallback, find the first occurrence of <!DOCTYPE html>
            const doctypeIndex = text.indexOf('<!DOCTYPE html>');
            if (doctypeIndex !== -1) {
                return text.substring(doctypeIndex);
            }
            
            console.error("Cleaned AI response did not start with <!DOCTYPE html>:", text);
            throw new Error('The AI did not return valid HTML content. It might be a partial response.');
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate content from AI. Please check the console for more details.");
    }
}

export async function generateScormPackageFromNotes(fileName: string, notesContent: string): Promise<ScormFiles> {
    const model = 'gemini-2.5-pro';
    const topic = fileName.replace(/\.zip$/i, '').replace(/_/g, ' ');

    const prompt = `
      You are an expert in instructional design and e-learning development, specializing in SCORM 1.2.
      Your task is to create a complete, self-contained SCORM 1.2 package from the provided markdown notes.
      The topic of the notes is "${topic}".

      Here is the content of the notes:
      ---
      ${notesContent}
      ---

      Generate a JSON object containing three files as strings: 'imsmanifest.xml', 'index.html', and 'scorm_api_wrapper.js'.

      **Instructions for 'index.html':**
      1.  It must be a single, self-contained HTML file.
      2.  Use the Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>.
      3.  Create a clean, professional, and responsive learning module layout. Use a dark theme.
      4.  The content must be based entirely on the provided notes. Summarize the key points into logical sections.
      5.  Include an interactive element, like a simple multiple-choice quiz (2-3 questions) based on the notes.
      6.  The page must include a "Mark as Complete" button.
      7.  Include a <script> tag that references "./scorm_api_wrapper.js".
      8.  Write JavaScript within the HTML file to:
          - Initialize the SCORM connection on page load using the wrapper.
          - When the "Mark as Complete" button is clicked, call the SCORM wrapper to set 'cmi.core.lesson_status' to 'completed'.
          - Provide visual feedback to the user when the button is clicked (e.g., disable the button, show a message).
          - Terminate the SCORM connection when the window is closed.

      **CRITICAL Instructions for 'imsmanifest.xml':**
      1.  **Create a valid SCORM 1.2 manifest file.** This is extremely important.
      2.  The root <manifest> element must have the correct namespaces and schema locations for SCORM 1.2.
          \`\`\`xml
          <manifest identifier="com.scorm.pack" version="1.2" 
                    xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" 
                    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" 
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                    xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
          \`\`\`
      3.  The <organization> identifier should be "org-1" and its <title> should be "${topic}".
      4.  The <item> identifier should be "item-1", link to a resource, and have a <title> of "${topic}".
      5.  The <resources> section must contain one <resource> element.
      6.  The <resource> element must be of type "webcontent", scormtype "sco", and its \`href\` must point to "index.html".
      7.  **Crucially, this <resource> element MUST list ALL files in the package using <file> tags.** This includes 'index.html' AND 'scorm_api_wrapper.js'.
          \`\`\`xml
            <resource ...>
              <file href="index.html" />
              <file href="scorm_api_wrapper.js" />
            </resource>
          \`\`\`

      **Instructions for 'scorm_api_wrapper.js':**
      1.  Provide a basic, robust SCORM 1.2 API wrapper.
      2.  It should safely find the SCORM API object in parent windows.
      3.  Implement functions for initialization, termination, getting values, and setting values.
      4.  Include clear comments explaining the code.

      The final output must be a single, valid JSON object and nothing else.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        'index.html': { type: Type.STRING },
                        'imsmanifest.xml': { type: Type.STRING },
                        'scorm_api_wrapper.js': { type: Type.STRING }
                    },
                    required: ['index.html', 'imsmanifest.xml', 'scorm_api_wrapper.js']
                }
            }
        });
        
        let jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as ScormFiles;

    } catch (error) {
        console.error("Error calling Gemini API for SCORM generation:", error);
        throw new Error("Failed to generate SCORM package from AI. Please check the console for more details.");
    }
}
