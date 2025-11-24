/**
 * Calls the Gemini API with exponential backoff.
 * @param {string} prompt The text prompt to send to the model.
 * @returns {Promise<string>} The generated text.
 */
export const callGeminiAPI = async (prompt) => {
  const apiKey = ""; // API key is handled by the environment
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return text;
      } else {
        throw new Error("Invalid response structure from API.");
      }
    } catch (error) {
      console.error(error);
      retries--;
      if (retries === 0) {
        throw new Error("Failed to get a response from Gemini API after multiple attempts.");
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};
