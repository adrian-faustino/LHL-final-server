const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const coordinateSchema = new Schema({
  x: {
    type: Number,
    required: true,
    unique: false,
  },
  y: {
    type: Number,
    required: true,
    unique: false,
  },
  color: {
    type: String,
    required: true,
    unique: false
  },
  lineSize: {
    type: Number,
    required: true,
    unique: false
  }
});

const Coordinate = mongoose.model('Coordinate', coordinateSchema);

module.exports = Coordinate;