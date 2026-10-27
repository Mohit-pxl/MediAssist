
const express = require("express");

const {
  addEmergencyContact,
  getEmergencyContacts,
} = require("../controllers/emergencyContactController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getEmergencyContacts)
  .post(protect, addEmergencyContact);

module.exports = router;
