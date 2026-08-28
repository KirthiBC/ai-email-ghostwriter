const mongoose=require('mongoose');

const EmailSchema=new mongoose.Schema({
    originalNotes:String,
    generatedEmail:String,
    tone:String,
    createdAt:{type:Date,default:Date.now}
 
});

module.exports=mongoose.model('Email'.EmailSchema);