
const Patient = require("../models/Patient");

const addEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, phone } = req.body;

    if (
      typeof name !== "string" ||
      typeof relationship !== "string" ||
      typeof phone !== "string" ||
      !name.trim() ||
      !relationship.trim() ||
      !phone.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, relationship, and phone are required",
      });
    }

    const patient = await Patient.findById(req.patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    patient.emergencyContacts.push({
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
    });

    await patient.save();

    const contact =
      patient.emergencyContacts[
        patient.emergencyContacts.length - 1
      ];

    return res.status(201).json({
      success: true,
      message: "Emergency contact added successfully",
      contact,
    });
  } catch (error) {
    console.error("Adding emergency contact failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add emergency contact",
    });
  }
};

const getEmergencyContacts = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patientId)
      .select("emergencyContacts");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      contacts: patient.emergencyContacts,
    });
  } catch (error) {
    console.error("Fetching emergency contacts failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch emergency contacts",
    });
  }
};

module.exports = {
  addEmergencyContact,
  getEmergencyContacts,
};
