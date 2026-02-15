// AttendanceSystem/models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "studentCount"
  seq: { type: Number, default: 0 } // Keeps count of number of students
});

module.exports = mongoose.model('Counter', counterSchema);
