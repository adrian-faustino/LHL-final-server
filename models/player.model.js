const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  username: {
    type: String,
    required: false,
    unique: false,
    trim: true,
  }, 
  coordinates: {
    type: [
      {
        type: Schema.Types.ObjectId, 
        ref: 'Coordinate'
      }
    ]
  }
}, {
  timestamps: false
})

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;