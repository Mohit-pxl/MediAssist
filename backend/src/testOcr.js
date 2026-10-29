
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  extractTextFromImage,
} = require("./services/ocrService");

const testOcr = async () => {
  try {
    const imagePath = path.join(
      __dirname,
      "sample-prescription.png"
    );

    const imageBuffer = fs.readFileSync(imagePath);
    const result = await extractTextFromImage(imageBuffer);

    console.log("Extracted text:");
    console.log(result.text || "(No text detected)");
    console.log("OCR confidence:", result.confidence);
    console.log("Needs review:", result.needsReview);
  } catch (error) {
    console.error("OCR test failed:", error.message);
    process.exitCode = 1;
  }
};

testOcr();
