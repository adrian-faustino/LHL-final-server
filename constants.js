/** All time variables in milliseconds **/

/** Switch between dev mode and production **/
const isDevMode = false;

const MAX_PLAYERS_PER_LOBBY = 4;

/** length of time in InstructionsView **/
const VIEW_TIME = 7000;

/** length of time in DrawGameView **/
const ROUND_TIME = 120000; 

/** the length of time we wait before sending the final coordinates out in the event that a player disconnects during the game **/
const DELAY_FOR_COORDS = 2000;

/** the rate which we are reducing the opacity by per game tick. 0.95 => 5% less everytime. **/
const OPACITY_DECAY = 0.98; 

const constants = {
  MAX_PLAYERS_PER_LOBBY,
  VIEW_TIME,
  ROUND_TIME,
  DELAY_FOR_COORDS,
  OPACITY_DECAY,
  isDevMode
}

module.exports = constants;