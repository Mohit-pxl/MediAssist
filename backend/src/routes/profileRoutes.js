
const express = require("express");
const { updatePatientProfile } = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.patch("/", protect, updatePatientProfile);

module.exports = router;
