const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq=require("groq-sdk");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Serve static files
app.use(express.static(path.join(__dirname,"public")));
app.get("/login1",(req, res)=> {
  res.sendFile(path.join(__dirname,"public","login1.html"));
});

app.get("/signup1",(req,res)=> {
  res.sendFile(path.join(__dirname,"public","signup1.html"));
  

});


// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Not connected", err));

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// EmailSchema
const EmailSchema = new mongoose.Schema({
  userId:{ type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  notes: String,
  emailBody: String,
  tone: String,
  date: { type: Date, default: Date.now },
});
const Email=mongoose.model("Email", EmailSchema);

// Create Gemini client
const groq=new Groq({apiKey: process.env.GROQ_API_KEY});


//Jwt authentication
function authMiddleware(req,res,next) {
  const token=req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET,(err, decoded) => {
    if (err) 
      return res.status(401).json({error:"Invalid Token"});
    req.userId = decoded.id;
    next();
  });
}


//signup route
app.post("/signup1", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPass });
    await user.save();
    res.json({ message: " user created successfully" });
  } catch (err) {
    if(err.code===11000){
      return res.status(400).json({error:"Email already exists"});
    }
    res.status(500).json({ error: "Signup Failed" });
  }

});

//login route
app.post("/login1", async (req, res) => {
  try {
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if (!user) return res.status(400).json({error:"User not Found"});

    const isMatch=await bcrypt.compare(password,user.password);
    if (!isMatch) return res.status(400).json({error:"Invalid Credentials"});


    const token=jwt.sign({id:user._id },process.env.JWT_SECRET,{expiresIn:"1h"});
    res.json({token});
  } catch (error) {
    res.status(500).json({error:"Login failed"});
  }

});



// Route: History
app.get("/history", authMiddleware, async (req, res) => {
  try {
    const{keyword,tone}=req.query;
    const query={userId:req.userId};
    if(keyword && keyword.trim() !== "") {
      query.notes={$regex:keyword,$options:"i"};
    }
    if(tone && tone !== "All") {
      query.tone=new RegExp("^"+tone+"$","i");
    }
    const data = await Email.find(query).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error("History fetch error: ",err);
    res.status(500).json({ error: "Could not fetch history" });
  }
});

app.post("/generate-email", authMiddleware, async (req, res) => {
  try {
    const { notes, tone } = req.body;
    if (!notes || !tone) {
      return res.status(400).json({ error: "Notes and tone are required" });
    }

    console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "Loaded ✓" : "MISSING ✗");
    console.log("Notes:", notes, "| Tone:", tone);

    console.log("Calling Groq...");
    const modelsList = await groq.models.list();
    console.log("MY_MODELS:", modelsList.data.map(m => m.id));
    
    const completion = await groq.chat.completions.create({
      
      model: "openai/gpt-oss-20b",
      messages: [{
        role: "user",
        content: `Write a ${tone} email based on these notes: "${notes}". Include a Subject Line and Proper Formatting.`
      }]
    });
    console.log("Groq response received");

    const generatedEmail = completion.choices[0].message.content;

    const newEntry = new Email({userId:req.userId,notes,emailBody:generatedEmail,tone:tone });
    await newEntry.save();

    res.json({ email: generatedEmail });
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});



//route:delete
app.delete("/history/:id", authMiddleware, async (req, res) => {
  try {
    await Email.findOneAndDelete({_id:req.params.id,userId:req.userId});
    res.json({success:true});
  }catch(err){
    res.status(500).json({error: "Could not delete email"});
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));