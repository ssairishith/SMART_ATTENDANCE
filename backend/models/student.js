// models/student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, unique: true },
  email: { type: String },
  face_encoding: { type: [Number] }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
