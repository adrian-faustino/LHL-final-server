const constants = require('../constants');
const util = require('../helpers/util');
const { MAX_PLAYERS_PER_LOBBY, DELAY_FOR_COORDS } = constants;
const { generateUniquePID, generateQuadrant } = util;



module.exports = function(games, client, db, io, app) {
  const { Lobby, Player, Coordinate } = db;


  app.post('/finalCoords', (req, res) => {
    const { coordinates, lobbyID, myQuadrant, PLAYERS_IN_ROOM } = req.body;
    
    // console.log(`Recieved coordinates from lobby ${lobbyID}:`, coordinates);
  
    /** Populate quadrants **/
    games[lobbyID].coordinates[myQuadrant] = coordinates;
    
    /** Emit final coordinates once all quadrants have been received **/
    const coordKeys = Object.keys(games[lobbyID].coordinates);
    const updatedCoords = coordKeys.filter(quadrant => games[lobbyID].coordinates[quadrant].length !== 0);


    if(updatedCoords.length === PLAYERS_IN_ROOM) {
      const finalCoordinates = games[lobbyID].coordinates;
  
      console.log(`Successfully received coordinates from all ${PLAYERS_IN_ROOM} players`);

      io.in(lobbyID).emit('finalCoordinates', finalCoordinates);
      res.send(`You're last to send data.`)
      
      console.log(games);
      console.log('Deleting game from memory.');

      delete games[lobbyID];
      return console.log('Deleted =>', games)
    } else {
      res.send('Successfully sent your final coordinates.');
    }

    /** This is to fix the issue where if a player disconnects midway through the game, the final coordinates will never send **/
    setTimeout(() => {
      if (games[lobbyID]) {
        const coordKeys = Object.keys(games[lobbyID].coordinates);
        const updatedCoords = coordKeys.filter(quadrant => games[lobbyID].coordinates[quadrant].length !== 0);
  
        if(updatedCoords.length !== PLAYERS_IN_ROOM) {
   
          const errMsg = `A player disconnected during the game.`
          console.log(errMsg);
  
          const finalCoordinates = games[lobbyID].coordinates;
  
          io.in(lobbyID).emit('err', errMsg);
          io.in(lobbyID).emit('finalCoordinates', finalCoordinates);

    
          delete games[lobbyID];
          return console.log('Deleted =>', games);
        }
      }
    }, DELAY_FOR_COORDS);
  });
  
  
  /** Handle create lobby **/
  app.post('/createLobby', (req, res) => {
    const { genLobbyID, myUsername } = req.body;
    if(games.hasOwnProperty(genLobbyID)) {
      console.log('That lobby exists already!');
    }
  
    games[genLobbyID] = {
        host: myUsername,
        coordinates: {},
        players: {}
    }
  
    const data = {
      myLobbyObj: games[genLobbyID],
    }
    console.log('Lobby created. Sending data:', data);
    res.json(data);
  });
  
  
  /** Handle join lobby **/
  app.post('/joinLobby', (req, res) => {
    const { lobbyID, myUsername } = req.body;
  
    console.log(`${myUsername} attempting to join lobby: ${lobbyID}`);
  
    if(!games[lobbyID]) {
      console.log(`That lobby doesn't exist!`);
      return res.status(500).send({err: 'Lobby doesn`t exist!'});
    }
  
    const currentUserNum = Object.keys(games[lobbyID].players).length;
  
    if(currentUserNum === MAX_PLAYERS_PER_LOBBY) {
      console.log('That lobby is full!');
      return res.status(500).send({err: 'Lobby is full!'});
    }

    /** Pass all filters => join lobby */
    console.log('Added to socket room:', lobbyID);
    client.join(lobbyID);
  
    const myLobbyObj = games[lobbyID];
    const myPlayerID = generateUniquePID(myLobbyObj.players);
    const myQuadrant = generateQuadrant(myLobbyObj.coordinates);
  
    /** Add player to players obj */
    myLobbyObj.players[myPlayerID] = {
      username: myUsername,
      ready: false,
      myQuadrant
    }
    /** Add quadrant to coordinates obj **/
    myLobbyObj.coordinates[myQuadrant] = [];
    
    console.log(`${myUsername} joined lobby ${lobbyID}. This lobby:`, myLobbyObj);
  
    const data = { myLobbyObj, myPlayerID };
    res.json(data);
  });
  
  /** Handle request for updated game lobby data **/
  app.post('/reqLobbyInfo', (req, res) => {
    const { lobbyID } = req.body;
  
    console.log('User request for lobby obj:', lobbyID);
    const data = { myLobbyObj: games[lobbyID] }
    res.json(data);
  })
  // === big rebuild

  app.post('/leaveLobby', (req, res) => {
    const { lobbyID, myUsername, myPlayerID } = req.body;

    try {
      const myQuadrant = games[lobbyID].players[myPlayerID].myQuadrant;
      
      /** Delete player from games obj and leave room **/
      delete games[lobbyID].coordinates[myQuadrant];
      delete games[lobbyID].players[myPlayerID];
      client.leave(lobbyID);
      
      const data = {
        myLobbyObj: games[lobbyID],
        leaver: myUsername
      }
      io.in(lobbyID).emit('userLeft', data);
      res.send({nextView: 'LandingView'});
    } catch(err) {
      console.log(`That player doesn't exist in this lobby.`);
      res.status(500).send({err: 'Something went wrong.'});
    }
  })

};