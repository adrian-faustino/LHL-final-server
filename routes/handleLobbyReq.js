const constants = require('../constants');
const util = require('../helpers/util');
const { MAX_PLAYERS_PER_LOBBY, DELAY_FOR_COORDS, LOBBY_DECAY, MAX_LOBBIES } = constants;
const { generateUniquePID, generateQuadrant, getIMG, randomNumAllInclusive } = util;



module.exports = function(games, client, db, io, app) {
  const { Lobby, Player, Coordinate } = db;


  app.post('/finalCoords', (req, res) => {
    const { coordinates, lobbyID, myQuadrant, PLAYERS_IN_ROOM } = req.body;
    
    // //
  
    /** Populate quadrants **/
    games[lobbyID].coordinates[myQuadrant] = coordinates;
    
    /** Emit final coordinates once all quadrants have been received **/
    const coordKeys = Object.keys(games[lobbyID].coordinates);
    const updatedCoords = coordKeys.filter(quadrant => games[lobbyID].coordinates[quadrant].length !== 0);


    if(updatedCoords.length === PLAYERS_IN_ROOM) {
      const finalCoordinates = games[lobbyID].coordinates;
  
      //

      io.in(lobbyID).emit('finalCoordinates', finalCoordinates);
      res.send(`You're last to send data.`)
      
      //
      //

      delete games[lobbyID];
      return //
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
          //
  
          const finalCoordinates = games[lobbyID].coordinates;
  
          io.in(lobbyID).emit('err', errMsg);
          io.in(lobbyID).emit('finalCoordinates', finalCoordinates);

    
          delete games[lobbyID];
          return //
        }
      }
    }, DELAY_FOR_COORDS);
  });
  
  
  /** Handle create lobby **/
  app.post('/createLobby', (req, res) => {
    const { genLobbyID, myUsername } = req.body;
    // if(Object.keys(games).length === MAX_LOBBIES) {
    //   /** Attemp to stop DDoS attack but not sure if this is the best way **/
    //   return res.status(500).send({err:'Too many active lobbies open at the moment. Please try again in a minute.'});
    // }

    if(games.hasOwnProperty(genLobbyID)) {
      //
      /**TODO: ask host to gen lobbyID again. I'm making the client gen the lobbyID so for future stretch, the user can set their own lobbyID or lobby name etc **/
    }
  
    games[genLobbyID] = {
        host: myUsername,
        coordinates: {},
        players: {}
    }
  
    const data = {
      myLobbyObj: games[genLobbyID],
    }
    //
    res.json(data);
  });

  /** Handle cancel lobby **/
  app.post('/cancelLobby', (req, res) => {
    const { lobbyID, nextView } = req.body;
    delete games[lobbyID];
    //

    res.send('ok');
    io.in(lobbyID).emit('cancelGame', nextView);
  })
  
  
  /** Handle join lobby **/
  app.post('/joinLobby', (req, res) => {
    const { lobbyID, myUsername } = req.body;
  
    //
  
    if(!games[lobbyID]) {
      //
      return res.status(500).send({err: 'Lobby doesn`t exist!'});
    }
  
    const currentUserNum = Object.keys(games[lobbyID].players).length;
  
    if(currentUserNum === MAX_PLAYERS_PER_LOBBY) {
      //
      return res.status(500).send({err: 'Lobby is full!'});
    }

    /** Pass all filters => join lobby */
    //
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
    
    //
  
    const data = { myLobbyObj, myPlayerID };
    res.json(data);
  });
  
  /** Handle request for updated game lobby data **/
  app.post('/reqLobbyInfo', (req, res) => {
    const { lobbyID } = req.body;
  
    //
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
      //
      res.status(500).send({err: 'Something went wrong.'});
    }
  })


  app.post('/getIMG', async (req, res) => {
    const { lobbyID } = req.body;

    // Make a request to pixabay for an array of images and respond with 1 random image
    const imagesArr = await getIMG();
    const gameIMG = imagesArr[randomNumAllInclusive(0, imagesArr.length)];

    io.in(lobbyID).emit('gameIMG', gameIMG);
    res.status(200).send('OK');
  })

};