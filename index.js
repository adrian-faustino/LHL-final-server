const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const { isDevMode } = require('./constants');


// middleware
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

// routes
// app.get('/test', (req, res) => res.send('Welcome to the test route!'));

/** For Heroku Deployment - change to false when working on local **/
if(!isDevMode) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../client/build/index.html'));
  })
} else {
  app.get('*', (req, res) => {
    //
    res.send('In dev mode...');
  })
}

// data
const games = require('./data/games');

// constants
const PORT = process.env.PORT || 5556;
const DB_URI = process.env.ATLAS_URI;

// database
// mongoose.connect(DB_URI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
// mongoose.set('useFindAndModify', false);

// const connection = mongoose.connection;
// connection.once('open', () => {
//   //
// })



// models
const Lobby = require('./models/lobby.model');
const Player = require('./models/player.model');
const Coordinate = require('./models/coordinate.model');
const db = {Lobby, Player, Coordinate};

// helpers
const handleCRUD = require('./routes/handleCRUD');
const handleGameState = require('./routes/handleGameState');
const handleLobbyReq = require('./routes/handleLobbyReq');

io.on('connection', client => {
  handleLobbyReq(games, client, db, io, app);
  handleCRUD(games, client, db);
  handleGameState(games, client, db, io);

  // handle DC client.on('disconnect') STRETCH
})

// server
http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
})
