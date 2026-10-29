
const crypto = require("crypto");
const path = require("path");

const supabase = require("../config/supabase");
const Prescription = require("../models/prescription");
const { hasValidFileSignature } = require("../utils/fileValidation");

const uploadPrescription = async (req, res) => {
  let storagePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please attach a prescription file",
      });
    }

    if (
      !hasValidFileSignature(req.file.buffer, req.file.mimetype)
    ) {
      return res.status(400).json({
        success: false,
        message: "File contents do not match the declared file type",
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


const getPrescriptionDownloadUrl = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.patientId,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .createSignedUrl(prescription.storagePath, 60);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      downloadUrl: data.signedUrl,
      expiresInSeconds: 60,
    });
  } catch (error) {
    console.error(
      "Creating prescription download URL failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to generate download link",
    });
  }
};


const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.patientId,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    const { error: storageError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([prescription.storagePath]);

    if (storageError) {
      console.error(
        "Prescription storage deletion failed:",
        storageError.message
      );

      return res.status(502).json({
        success: false,
        message: "Unable to delete prescription file",
      });
    }

    await Prescription.deleteOne({
      _id: prescription._id,
      patient: req.patientId,
    });

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Prescription deletion failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete prescription",
    });
  }
};




module.exports = { uploadPrescription, getMyPrescriptions, getPrescriptionDownloadUrl, deletePrescription };
