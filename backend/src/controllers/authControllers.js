const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");


//Patient registration 
const registerPatient = async(req,res)=>{
    try{
        const {name,email,password}=req.body;

        //validating fields
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"Name, email, and password are required",
            })
        }

         // 2. Validate basic input formats
        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedName) {
            return res.status(400).json({
            success: false,
            message: "Name cannot be empty",
        });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
            success: false,
            message: "Please provide a valid email address",
        });
        }

        if(typeof password !=="string" || password.length<0){
        return res.status(400).json({
            success:false,
            message:"Password must contain at least 8 characters",
        });
        }

        //checking whether email is already exist
        const existingPatient = await Patient.findOne({
            email:normalizedEmail,
        });

        if(existingPatient){
            return res.status(409).json({
            success:false,
            message:"An account with this email already exist",
        });
        }

         //Hash the Password
        const passwordHash = await bcrypt.hash(password,12);

        //Save the patient in mongoDB
        const patient=await Patient.create({
            name:normalizedName,
            email:normalizedEmail,
            passwordHash,
        })

        //Return safe data only
        return res.status(201).json({
            success:true,
            message:"Patient registered successfully",
            patient:{
                id:patient._id,
                name:patient.name,
                email:patient.email,
                createdAt:patient.createdAt,
            },
        });
    }catch(error){
        // Handle a duplicate-email race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Patient registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register patient at this time",
    });
    }

}

const loginPatient = async(req,res)=>{
    try{
        const {email,password}=req.body;

        //validating input
        if(
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ){
            return res.status(400).json({
                success:false,
                message:"Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find patient and explicitly include passwordHash
        const patient = await Patient.findOne({
            email:normalizedEmail,
        }).select("+passwordHash");

        // Use the same error for unknown email and wrong password
        if (!patient) {
            return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });

        const isPasswordValid = await bcrypt.compare(
            password,
            patient.passwordHash
        )

        if(!isPasswordValid){
            return res.status(401).json({
                success:false,
                meassage:"Invalid email or password",
            });
        }

        //creating a signed JWT
        const token = jwt.sign(
            {sub: patient._id.toString()},
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRES_IN || "1d"}
        )

        //return token and safe patient data
        return res.status(200).json({
            success:true,
            message:"Login Successful",
            token,
            patient:{
                id:patient._id,
                name:patient.name,
                email:patient.email,
            },
        });
    }
  }catch(error){
    console.error("Patient login failed:",error.meassage);
    
    return res.status(500).json({
      success: false,
      message: "Unable to log in at this time",
    });
  }
}

module.exports={registerPatient, loginPatient};