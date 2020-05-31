const axios = require('axios');

function randomNumAllInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// returns a 6 digit alphanumeric all capital ID
function generatePlayerID(ID_length) {
  // List does not include 0 or O;
  const ALPHA_NUM = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let id = ''

  // push random letters/numbers into the array until desired ID length
  for (let i = 0; i < ID_length; i++) {
    const randomIndex = randomNumAllInclusive(0, ALPHA_NUM.length - 1);
    id += ALPHA_NUM[randomIndex]
  }

  return id;
}

function generateUniquePID(playersObj) {
  const uniqueID = generatePlayerID(6);
  if (playersObj.hasOwnProperty(uniqueID)) {
    uniqueID = generateUniquePID(playersObj);
  }

  return uniqueID;
}

function generateQuadrant(coordinatesObj) {
  let myQuadrant = '';

  if(!coordinatesObj.hasOwnProperty('quadrant_1')) {
    myQuadrant = 'quadrant_1';
  } else if(!coordinatesObj.hasOwnProperty('quadrant_2')) {
    myQuadrant = 'quadrant_2';
  } else if(!coordinatesObj.hasOwnProperty('quadrant_3')) {
    myQuadrant = 'quadrant_3';
  } else if(!coordinatesObj.hasOwnProperty('quadrant_4')) {
    myQuadrant = 'quadrant_4';
  }

  return myQuadrant;
}

async function getIMG() {
  // constants
  const API_KEY = '16805778-e9c04da706ff9dae9c860dad1';
  const API_BASE_QUERY = `https://pixabay.com/api/?key=${API_KEY}`;
  const QUERY = API_BASE_QUERY + '&image_type=photo&orientation=vertical&per_page=200';
  
  let imagesArr;

  await axios.get(QUERY).then(response => {
    // console.log(response.data.hits)
    imagesArr = response.data.hits})
  .catch(err => console.log(err));


  return imagesArr;
}

const util = {
  randomNumAllInclusive,
  generatePlayerID,
  generateUniquePID,
  generateQuadrant,
  getIMG
}

module.exports = util;