
const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const uploadErrorMiddleware = require("../middlewares/uploadErrorMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {uploadPrescription, getMyPrescriptions} = require("../controllers/prescriptionController");


const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("prescription"),
  uploadPrescription
);

router.get("/", protect, getMyPrescriptions);

module.exports = router;
