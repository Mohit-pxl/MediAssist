
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Patient = require("./models/Patient");

const testPatientModel = async () => {
  try {
    await connectDB();

    console.log("Patient model loaded:", Patient.modelName);
    console.log(
      "Patient fields:",
      Object.keys(Patient.schema.paths)
    );

  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

testPatientModel();
