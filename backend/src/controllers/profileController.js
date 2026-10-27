
const Patient = require("../models/Patient");

const updatePatientProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, medicalHistory, allergies } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name must be a non-empty string",
        });
      }

      updates.name = name.trim();
    }

    if (dateOfBirth !== undefined) {
      if (dateOfBirth === null || dateOfBirth === "") {
        updates.dateOfBirth = null;
      } else {
        const parsedDate = new Date(dateOfBirth);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid date of birth",
          });
        }

        if (parsedDate > new Date()) {
          return res.status(400).json({
            success: false,
            message: "Date of birth cannot be in the future",
          });
        }

        updates.dateOfBirth = parsedDate;
      }
    }

    if (medicalHistory !== undefined) {
      if (
        !Array.isArray(medicalHistory) ||
        !medicalHistory.every(
          (item) => typeof item === "string" && item.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Medical history must be an array of non-empty strings",
        });
      }

      updates.medicalHistory = medicalHistory.map((item) => item.trim());
    }

    if (allergies !== undefined) {
      if (
        !Array.isArray(allergies) ||
        !allergies.every(
          (item) => typeof item === "string" && item.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Allergies must be an array of non-empty strings",
        });
      }

      updates.allergies = allergies.map((item) => item.trim());
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.patientId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
      },
    });
  } catch (error) {
    console.error("Profile update failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update patient profile",
    });
  }
};

module.exports = { updatePatientProfile };
