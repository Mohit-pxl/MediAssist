
const crypto = require("crypto");
const path = require("path");

const supabase = require("../config/supabase");
const Prescription = require("../models/prescription");

const uploadPrescription = async (req, res) => {
  let storagePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please attach a prescription file",
      });
    }

    const extensionByMimeType = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "application/pdf": ".pdf",
    };

    const extension = extensionByMimeType[req.file.mimetype];

    if (!extension) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    const fileName = `${crypto.randomUUID()}${extension}`;

    storagePath = `${req.patientId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const prescription = await Prescription.create({
      patient: req.patientId,
      storagePath,
      originalName: path.basename(req.file.originalname).slice(0, 255),
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      status: "uploaded",
    });

    return res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully",
      prescription: {
        id: prescription._id,
        originalName: prescription.originalName,
        mimeType: prescription.mimeType,
        sizeBytes: prescription.sizeBytes,
        status: prescription.status,
        createdAt: prescription.createdAt,
      },
    });
  } catch (error) {
    // If MongoDB saving fails after the file upload,
    // remove the orphaned file from Supabase.
    if (storagePath) {
      await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove([storagePath])
        .catch(() => {});
    }

    console.error("Prescription upload failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to upload prescription",
    });
  }
};


const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.patientId,
    })
      .select(
        "originalName mimeType sizeBytes status createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error(
      "Fetching prescriptions failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch prescriptions",
    });
  }
};


module.exports = { uploadPrescription, getMyPrescriptions, };
