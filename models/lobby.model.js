const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const lobbySchema = new Schema({
  lobbyID: {type: String, required: true, unique: true, trim: true},
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Player'
    }
  ],
  currentView: {
    type: String,
    required: true, 
  }
}, {
  timestamps: true
})

const Lobby = mongoose.model('Lobby', lobbySchema);

module.exports = Lobby;

// lobbies = [...lobby];

// lobby = {
//   lobbyID,
//   players: [],
//   currentView
// }

// player = {
//   username,
//   coordinates: []
// }

// cooordinate = {
//   x,
//   y,
//   color,
//   lineSize
// }