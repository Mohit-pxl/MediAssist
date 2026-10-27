const express= require("express");
const {registerPatient, loginPatient, getCurrentPatient} = require("../controllers/authControllers");

const {protect} = require("../middlewares/authMiddleware");

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", registerPatient);
router.post("/login",loginPatient);

//protected route
router.get("/me",protect,getCurrentPatient);

module.exports = router;