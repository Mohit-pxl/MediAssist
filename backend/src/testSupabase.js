
require("dotenv").config();

const supabase = require("./config/supabase");

const testSupabase = async () => {
  try {
    const { data, error } = await supabase.storage.getBucket(
      process.env.SUPABASE_BUCKET
    );

    if (error) {
      throw error;
    }

    console.log("Supabase connection successful");
    console.log("Bucket name:", data.name);
    console.log("Bucket is public:", data.public);
  } catch (error) {
    console.error("Supabase test failed:", error.message);
    process.exitCode = 1;
  }
};

testSupabase();
