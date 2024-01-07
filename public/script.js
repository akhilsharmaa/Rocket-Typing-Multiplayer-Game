// Variables to keep track of game state
var wordCount = 0;
var letterCount = 0;
var scoreCount = 0;
var isStarted = false;
var isMultiplayer = false;
var noOfsecondPassed = 0;
var numberOfSecondToCompete = 20;

// Get HTML elements
var un_typedTextElement = document.getElementById('ToTypeText');
var key_to_press_box = document.getElementById('key_to_press_box');
var score_number = document.getElementById('score-number');
var accuracy_text = document.getElementById('accuracy_text');
var wpm_text = document.getElementById('wpm_text');
var countdownElement = document.getElementById("countdown");

// Audio for incorrect key press
var buzzer_sound = new Audio('./res/buzzer_sound.wav');
var tick_sound = new Audio('./res/tick.mp3');
var tick_2x_sound = new Audio('./res/fast_clock.mp3');
var timup_sound = new Audio('./res/timup_sound.mp3');
var ooops_sound = new Audio('./res/ooops.mp3');

// Initialize array with string length
let stringLenght = un_typedTextElement.innerHTML;
let arrayOfIntegers = new Array(stringLenght.length).fill(1);


countdownElement.innerHTML = numberOfSecondToCompete;

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

            ooops_sound.play();
        }

        scoreCount = Math.max(0, scoreCount);
    }

    wpm_text.innerHTML =  findWPM(noOfsecondPassed, wordCount).toFixed(2); // Update accuracy
    score_number.innerHTML = scoreCount;
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

      if(timeleft <= 0){
        clearInterval(downloadTimer);
        countdownElement.innerHTML = "00";
      } else {
        countdownElement.innerHTML = timeleft ;
      }

      if(timeleft == 1){
        timup_sound.play();
        
      }else if(timeleft <= 5){
        // countdownElement.style.color = "#f00";
        tick_2x_sound.play();

      }else if(timeleft == 10){
        countdownElement.style.color = "#fcd703";
        tick_2x_sound.play();

      }else {
        tick_sound.play();
      }


      timeleft -= 1;
      noOfsecondPassed += 1;
    }, 1000);
  }
  

  function updateTime(newTimeLeft){

  }

  function hideStartButton(){

  }

  function closeMultiplayerWindow(){
    var wrapper_add_player_container = document.getElementById('wrapper_add_player_container');
    wrapper_add_player_container.style.display = "none";
  }

  function openMultiplayerWindow(){
    var wrapper_add_player_container = document.getElementById('wrapper_add_player_container');
    wrapper_add_player_container.style.display = "flex";
  }



  const socket = io();