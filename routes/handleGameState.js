const constants = require('../constants');
const { VIEW_TIME, ROUND_TIME, OPACITY_DECAY } = constants; 

module.exports = function(games, client, db, io) {
  // models
  const { Lobby, Player, Coordinate } = db; 


  client.on('joinLobby', data => {
    const { lobbyID, myUsername } = data;
    console.log(`Attempting to join lobby ${lobbyID}...`);
    client.join(lobbyID);
    io.in(lobbyID).emit('newUserJoined', myUsername);
  });


  client.on('cancelGame', data => {
    const { lobbyID, nextView } = data;
    delete games[lobbyID];

    client.to(lobbyID).emit('cancelGame', nextView);
  });


  client.on('startGame', data => {
    const { lobbyID, nextView } = data;
    io.in(lobbyID).emit('changeView', nextView);

    let opacity = 1;
    let interval;

    /** Timeout for InstructionsView **/
    setTimeout(() => {
      io.in(lobbyID).emit('changeView', 'DrawGameView');
  

      /** Fade logic - Also dictates countdown timer **/
      let interval;
      let opacity = 1;
     
      interval = setInterval(() => {
        opacity *=  OPACITY_DECAY;
  
        io.in(lobbyID).emit('fadeSilhouette', opacity);
      }, 800);


      /** Timeout for DrawGameView **/
      setTimeout(() => {
        console.log('Game finished.');
        clearInterval(interval);
        io.in(lobbyID).emit('roundFinished')
      }, ROUND_TIME);

    }, VIEW_TIME);
  });
};