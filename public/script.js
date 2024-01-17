'use strict';
const socket = io();

// Variables to keep track of game state
var wordCount = 0;
var letterCount = 0;
var scoreCount = 0;
var isStarted = false;
var isMultiplayer = false;
var noOfsecondPassed = 0;
var numberOfSecondToCompete = 20;
var socket_id = "NULL";
var room_id = "NULL";

// Get HTML elements
var un_typedTextElement = document.getElementById('ToTypeText');
var key_to_press_box = document.getElementById('key_to_press_box');
var score_number = document.getElementById('score-number');
var accuracy_text = document.getElementById('accuracy_text');
var wpm_text = document.getElementById('wpm_text');
var countdownElement = document.getElementById("countdown");
var createRoomContainer = document.getElementById('createRoomContainer');

// Audio for incorrect key press
var buzzer_sound = new Audio('./res/buzzer_sound.wav');
var tick_sound = new Audio('./res/tick.mp3');
var tick_2x_sound = new Audio('./res/fast_clock.mp3');
var timup_sound = new Audio('./res/timup_sound.mp3');
var ooops_sound = new Audio('./res/ooops.mp3');

// Initialize array with string length
let stringLenght = un_typedTextElement.innerHTML;
let arrayOfIntegers = new Array(stringLenght.length).fill(1);

regenrateRoomID(); 
hideMultiplayerWindow();
hideLivePlayerCardButton();
hideGetReadyCountdownWrapper();

countdownElement.innerHTML = numberOfSecondToCompete;


// Listen for the 'newUserJoined' event on the socket
socket.on('newUserJoined', (msg) => {
  // Update the socket_id variable with the received message
  socket_id = msg;

  // Call the setUserSocketID function to handle the updated socket_id
  setUserSocketID();
});



socket.on('connect', function() {
    // Access the socket ID directly using socket.id
    const socketId = socket.id;
    // Now you can use the socket ID as needed
    setUserSocketID(socketId);
});




//* UPADTED OF ROOM DATA FROM SERVER 
socket.on('roomData', (roomDataJSONList) => {

    // console.log('Received avatar data:', roomDataJSONList);
    
     // Get the playersTab element from the DOM
    var playerTab = document.querySelector('#playersTab');

    // Clear child elements of the playersTab element
    clearChildElements(playerTab);

    // Iterate through the roomDataJSONList to update player information
    for (const [playerSocketID, playerInfo] of Object.entries(roomDataJSONList)) {

        // Extract player information from the received data
        const playerName = playerInfo.name;
        const playerScore = playerInfo.score;
        const playerAvatarLink = playerInfo.avatar_link;

        // console.log(playerName, playerScore, playerAvatarLink);
        createPlayerBox(playerName, playerAvatarLink, playerScore)
    }
  
});



socket.on('startGameInitilization',  (gameliveUpdate) => {

        isMultiplayer = true; 
        hideMultiplayerWindow();
        hideMultiplayerButton();
        showLivePlayerCardButton();
});


socket.on('getReadyContDown',  (no_of_sec_to_getReady) => { 

    showGetReadyCountdownWrapper(no_of_sec_to_getReady);
    
});




socket.on('gameliveUpdate',  (gameliveUpdate) => {

    
});




// Event listener for keydown
document.addEventListener('keydown', function (event) {

    if(isStarted == false && isMultiplayer == false){
        isStarted = true;
        // Example usage
        startCountdown(numberOfSecondToCompete);
        hideStartButton();
    }

    const firstCharacter = un_typedTextElement.textContent.charAt(0);

    if (event.key === firstCharacter) {
        // Correct key pressed
        deleteFirstCharacter();
        letterCount += 1;
        scoreCount += 1;

    } else if ((event.key === ' ' && firstCharacter == '_')) {
        // Special case for space key
        deleteFirstCharacter();
        wordCount += 1;
        letterCount += 1;
        scoreCount += 3;

        accuracy_text.innerHTML = findAccuarcy().toFixed(2); // Update accuracy
    
    } else {
        // Incorrect key pressed
        arrayOfIntegers[letterCount] = 0;

        if (event.key.length == 1) {
            // Incorrect single character key pressed
            key_to_press_box.style.visibility = 'visible';
            key_to_press_box.innerHTML = event.key;
            scoreCount -= 2;

            // ooops_sound.play();
        }

        scoreCount = Math.max(0, scoreCount);
    }

    wpm_text.innerHTML =  findWPM(noOfsecondPassed, wordCount).toFixed(2); // Update accuracy
    score_number.innerHTML = scoreCount;


    // send score update data to server
    socket.emit('updatePlayerScore', 
                {
                   "playerID": socket_id,
                   "score": scoreCount
                });

});



// Function to calculate accuracy
function findAccuarcy() {
    var CorrectTyped = 0;

    for (let i = 0; i <= letterCount; i++) {
        CorrectTyped += arrayOfIntegers[i];
    }

    return (CorrectTyped / letterCount) * 100.0;
}

// Function to calculate wpm word per minute
function findWPM(sec, words) {

    if(wordCount == 0 || sec == 0){
        return 0; 
    }

    if(sec <= 60){
        return (60.0/sec) * words; 
    }
    
    console.log(60.0/sec) * words;
    return Math.max(0,  (sec/60.0) * words); 
}


// Event listener for keyup to hide the key press box
document.addEventListener('keyup', function (event) {
    key_to_press_box.style.visibility = 'hidden';
});

// Function to delete the first character from the untyped text
function deleteFirstCharacter() {

    var currentText = un_typedTextElement.innerHTML;

    if (currentText.length > 0) {
        var firstCharacter = currentText[0];

        // Delete the character
        var newText = currentText.substring(1);
        un_typedTextElement.innerHTML = newText;

        // Add the character to the typed text
        var typedTextElement = document.getElementById('typedText');
        var currentTypedText = typedTextElement.innerHTML;
        typedTextElement.innerHTML += firstCharacter;
    }
}


function startCountdown(initialTime) {

      var timeleft = initialTime;

      var downloadTimer = setInterval(function(){

          setTimerTextColor(timeleft)

          timeleft -= 1;
          noOfsecondPassed += 1;
    }, 1000);
}



  
function setTimerTextColor(timeleft) {
    // Check if timeleft is less than or equal to 0
    if (timeleft <= 0) {
        // Clear the interval and set the countdown element to "00"
        clearInterval(downloadTimer);
        countdownElement.innerHTML = "00";
    } else {
        // Update the countdown element with the current timeleft
        countdownElement.innerHTML = timeleft;
    }

    // Check specific conditions for changing the text color
    if (timeleft == 1) {
        // timup_sound.play();
    } else if (timeleft <= 5) {
        // Change text color to red and 
        countdownElement.style.color = "#f00";
        // tick_2x_sound.play();
    } else if (timeleft == 10) {
        // Change text color to yellow and 
        countdownElement.style.color = "#fcd703";
        // tick_2x_sound.play();
    } else {
        // tick_sound.play();
    }
}


  function hideStartButton(){
    
  }

  function hideMultiplayerButton(){
    var  go_multiplayer_btn = document.getElementById('go_multiplayer_btn');
    go_multiplayer_btn.style.display = "none";
  }



function openMultiplayerWindow(){
      var wrapper_add_player_container = document.getElementById('wrapper_add_player_container');
      wrapper_add_player_container.style.display = "flex";
      regenrateRoomID();
}

function hideMultiplayerWindow(){
    var wrapper_add_player_container = document.getElementById('wrapper_add_player_container');
    wrapper_add_player_container.style.display = "none";
}


function showLivePlayerCardButton(){
    var live_player_status_container = document.getElementById('live_player_status_container');
    live_player_status_container.style.display = "block";
}

function hideLivePlayerCardButton(){
    var live_player_status_container = document.getElementById('live_player_status_container');
    live_player_status_container.style.display = "none";
}


function showGetReadyCountdownWrapper(second){
    var get_ready_countdown_wrapper = document.getElementById('get_ready_countdown_wrapper');
    get_ready_countdown_wrapper.style.display = "flex";

    var reverse_conter_time_number = document.getElementById('reverse_conter_time_number');
    reverse_conter_time_number.innerHTML = second;
}

function hideGetReadyCountdownWrapper(){
    var get_ready_countdown_wrapper = document.getElementById('get_ready_countdown_wrapper');
    get_ready_countdown_wrapper.style.display = "none";
}



// Function to handle joining a match
function joinMatch() {
  
  // Get input elements from the form
  const roomIdInput = document.getElementById('roomIdTextInput');
  const nameInput = document.getElementById('nameTextInput');
  const socketIdInput = document.getElementById('socketId_TextInput');

  // Create an object with player room data
  const playerRoomData = {
    name: nameInput.value,
    room_id: roomIdInput.value,
    user_socket_id: socketIdInput.value
  };

  // Emit a 'joinMatch' event to the server with player room data
  socket.emit('joinMatch', playerRoomData);

  // Hide the 'Join Match' tab
  hideJoinMatchTab();

  // Show the 'Waiting Players' tab
  showWatingPlayersTab();

  // Set user socket ID (assuming you have a function for this)
  setUserSocketID();

  // Update the displayed room ID in the HTML
  const roomID_Div = document.getElementById('roomIDTextSpan');
  roomID_Div.innerHTML = roomIdInput.value;
  room_id = roomIdInput.value;
}


function startTheMatchClicked(){
    socket.emit('startMatchRequest', 
              {
                "socket_id":socket_id,  
                "room_id": room_id
              });
}



function regenrateRoomID(){
  var roomIdTextInput = document.getElementById('roomIdTextInput');
  roomIdTextInput.value =  generateRandomString(6);
}

function setUserSocketID(){ 
  var socketId_TextInput = document.getElementById('socketId_TextInput');     
  socketId_TextInput.value = socket_id;
}

function hideWatingPlayersTab(){
  var watingPlayersTab = document.getElementById('watingPlayersTab');
  watingPlayersTab.style.display = "none";
}

function showWatingPlayersTab(){
  var watingPlayersTab = document.getElementById('watingPlayersTab');
  watingPlayersTab.style.display = "flex";
}

function hideJoinMatchTab(){
  var joinRoomContainer = document.getElementById('joinRoomContainer');
  joinRoomContainer.style.display = "none";
}

function closeMultiplayerWindow(){
  var wrapper_add_player_container = document.getElementById('wrapper_add_player_container');
  wrapper_add_player_container.style.display = "none";
}



// Function to create and append player boxes
function createPlayerBox(player_name, playerAvatarLink, playerScore) {
  // Create elements
  var playerBox = document.createElement('div');
  playerBox.classList.add('playerBox');

  var box89 = document.createElement('div');
  box89.classList.add('box89');

  var playerImage = document.createElement('img');
  playerImage.classList.add('player_logo_image');
  playerImage.src = playerAvatarLink;
  playerImage.alt = 'Player Image';

  var playerName = document.createElement('div');
  playerName.classList.add('playername');
  playerName.textContent = player_name;

  // Append elements to the player box
  box89.appendChild(playerImage);
  playerBox.appendChild(box89);
  playerBox.appendChild(playerName);


  // Append the player box to the container
  document.getElementById('playersTab').appendChild(playerBox);
}

// Function to clear all child elements under a given parent element
function clearChildElements(parentElement) {
    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
    }
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
