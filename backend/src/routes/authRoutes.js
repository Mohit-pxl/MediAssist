const express= require("express");
const {registerPatient, loginPatient} = require("../controllers/authControllers");

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", registerPatient);
router.post("/login",loginPatient);

module.exports = router;