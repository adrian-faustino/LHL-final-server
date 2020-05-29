/** All time variables in milliseconds **/

/** Switch between dev mode and production **/
const isDevMode = true;

const MAX_PLAYERS_PER_LOBBY = 4;
const MAX_LOBBIES = 50;

/** length of time in InstructionsView **/
const VIEW_TIME = 12000;

/** length of time in DrawGameView **/
const ROUND_TIME = 90000; 

/** the length of time we wait before sending the final coordinates out in the event that a player disconnects during the game **/
const DELAY_FOR_COORDS = 1500;

/** the rate which we are reducing the opacity by per game tick. 0.95 => 5% less everytime. **/
const OPACITY_DECAY = 0.97;

/** the time which lobbies will get deleted in the case where they are open for too long - change last number only **/
const LOBBY_DECAY = VIEW_TIME + ROUND_TIME + DELAY_FOR_COORDS + 2000;


const constants = {
  MAX_PLAYERS_PER_LOBBY,
  MAX_LOBBIES,
  VIEW_TIME,
  ROUND_TIME,
  DELAY_FOR_COORDS,
  OPACITY_DECAY,
  LOBBY_DECAY,
  isDevMode,
}

module.exports = constants;