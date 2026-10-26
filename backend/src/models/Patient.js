const mongoose=require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"Nams is required"],
            trim:true,
        },

        email:{
            type:String,
            required:[true,"Email is required"],
            unique:true,
            lowercase:true,
            trim:true,
        },

        passwordHash:{
            type:String,
            required:[true,"Password hash is required"],
            select:false,
             
        },

        dateOfBirth:{
            type:Date,
            default:null,
        },

        medicalHistory:{
            type:[String],
            default:[],
        },

        allergies:{
            type:[String],
            default:[],
        }
    },
        {
            timestamps:true,
        }

);

const Patient = mongoose.model("Patient",patientSchema);

module.exports=Patient;