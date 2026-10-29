
const { createWorker } = require("tesseract.js");

const extractTextFromImage = async (imageBuffer) => {
  const worker = await createWorker("eng");

  try {
    const { data } = await worker.recognize(imageBuffer);

      return {
          text: data.text.trim(),
          confidence: data.confidence,
          needsReview: data.confidence < 70,
      };
  } finally {
    await worker.terminate();
  }
};

module.exports = { extractTextFromImage };
