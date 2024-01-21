
const http = require("http");
const bodyParser = require('body-parser');
const { createServer } = require('node:http');
const express = require('express');
const app = express();
const join  = require('node:path');
const { Server } = require('socket.io');
const { log, count } = require("console");
const colog = require('colog');

const server = http.createServer(app);
const io = new Server(server);
            const SEC_GAME_DURATION = 100;

const PORT = process.env.PORT || 3000;
const GAME_DURATION_IN_SECOND = 100;


const avatarLink_list = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjGcTeLUMuVUORjPxactDdTiFRgUWSws9sJBSJQQGQsJp4qkyuUzywRsI94zqTdeI7QeM&usqp=CAU", 
    "https://img.lovepik.com/free-png/20210923/lovepik-crystal-fox-front-cartoon-avatar-png-image_401269767_wh1200.png", 
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0EgoOPcypYckMFAV_AiJVf6zVBrg-zsaDFbunWatYOnPZvFpn_9XSr6iUzEtw-nlpjqg&usqp=CAU", 
    "https://st3.depositphotos.com/6937784/36076/v/450/depositphotos_360769008-stock-illustration-cute-panda-face-vector-illustration.jpg",
    "https://img.freepik.com/premium-vector/common-panda-bear-mammal-animal-face_313877-13038.jpg", 
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWikbhPSl7ZH3FKd54bQZR9aJZhCYdZLTgJkEQwyU1IVFhY43aPOqiLTCHM_i3Rog1iaM&usqp=CAU", 
    "https://as2.ftcdn.net/v2/jpg/02/24/50/83/1000_F_224508313_nIjob7G5iwvrw4gvPM41Ovg72jrSfKDJ.jpg", 
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuSpCy1BtTcB6UvhMBQq7PxThKj7Plb4E9IKYmOeOgrTIuWqeXbaefrNhhTlCb7Ux-UaU&usqp=CAU", 
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfNuUqF1amZ4t6NvkzH-YvJHiVfCgcb5LK2yz4BjL6Jl6KbTXcfMNC6yF5yXM0YqPHAdk&usqp=CAU", 
    "https://png.pngtree.com/png-clipart/20210425/original/pngtree-tiger-face-logo-png-image_6249664.jpg", 
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoqSaTGl76F1oZkag7UkTF2eImUrjvOma3jZBrJUNebSWMwYJXh9jeRTpmTGk2mkACJEA&usqp=CAU"
  ] 


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Set the views directory
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

var roomsDetailArrayList = {

}

/*
---------------------------------------------------
-- SOCKET CONNECTION ESTABLISHED USING SOCKET.IO --
--------------------------------------------------- */

io.on('connection', (socket) => {

      colog.log(colog.color('--- CONNECTED NEW SOCKET: ', 'green') + colog.color(socket.id, 'yellow'));

      io.emit("newUserJoined", socket.id);  

      //* A Player requested to join the ROOM with a specific roomID
      socket.on('joinMatch', (playerRoomData) => {

            // LOGGING
            colog.log("\nRoom Joining/Creating Request:");
            console.log(playerRoomData);

            //* JOIN THE SOCKET TO A SPECIFIC ROOM 
            try {
                socket.join(playerRoomData.room_id);
            } catch (error) {
                colog.error(error);
            }
            
            createOrUpdateUserInRoom(playerRoomData.room_id, 
                                    playerRoomData.user_socket_id, 
                                    playerRoomData.name);

            // SEND THE roomsDetailArrayList if new user join
            io.to(playerRoomData.room_id)
                .emit("roomData", roomsDetailArrayList[playerRoomData.room_id]);


            //* A Player requested to join the ROOM with a specific roomID
            socket.on('scoreUpdateByPlayer', (updateData) => {

                  var roomID = updateData["roomID"];
                  var socketID = updateData["socketID"];
                  var scoreCount = updateData["scoreCount"];

                  //? UPDATE THE ROOM DETAIL ARRAY */
                  updatePlayerScoreOnly(roomID, socketID, scoreCount);
            });

      });

      


      socket.on('startMatchRequest', async (gameStartingData) => {

            room_id = gameStartingData["room_id"]
            socket_id = gameStartingData["socket_id"]

            // SEND THE roomsDetailArrayList if new user join
            io.to(room_id)
                .emit("startGameInitilization", "");

            colog.success('\n++++++++++++++ STARTED: NEW MULTIPLAYER GAME  +++++++++ ');

            /**
            * Starts the countdown for the "get ready" phase in a room using Socket.io. */
            const startGetReadyCountdownCounter = async (io, room_id, duration) => {
                  


                  const countdown = async (count) => {
                      if (count > 0) {
                  
                          // Emit the current count to the room
                          io.to(room_id)
                              .emit("getReadyContDown", count);
                              
                          await new Promise((resolve) => setTimeout(resolve, 1000));
                          // Recursively call the countdown function with the updated count
                          await countdown(count - 1);
                      }
                  };
              
                  await countdown(duration);
            };


            colog.progress(0, GAME_DURATION_IN_SECOND, "asd");

            const startedGameCountdownCounter = async (io, room_id, duration) => {
              
                  const countdown = async (count) => {
                      if (count >= 0) {

                          // console.log("Timer:", count);
                          colog.progress();

                          const gameRoomLiveUpdateDataJson = {
                              "time": count, 
                              "playersData": roomsDetailArrayList[room_id]
                          }

                          io.to(room_id)
                              .emit("gameRoomLiveUpdateDataJson", gameRoomLiveUpdateDataJson);
                          
                                            
                          await new Promise((resolve) => setTimeout(resolve, 1000));
                          await countdown(count - 1);
                      }
                  };

                  await countdown(duration);
          };
      

          
            // Countdown for SEC_TOGETREADY seconds
            const SEC_TOGETREADY = 3;
            await startGetReadyCountdownCounter(io, room_id, SEC_TOGETREADY);


            await startedGameCountdownCounter(io, room_id, GAME_DURATION_IN_SECOND);
            colog.error('++++++++++++++ ENDED: MULTIPLAYER GAME +++++++++++++++++\n');


      });



      //* DISCONNECTING THE USER 
      socket.on('disconnect', () => {

            colog.log(colog.color('--- DISCONNECTED  SOCKET: ', 'red') + colog.color(socket.id, 'yellow'));

      });
});
// --------------------------------------------------

function updatePlayerScoreOnly(roomID, socketID, scoreCount){

    // Ensure roomsDetailArrayList is defined
    if (!roomsDetailArrayList) {
      roomsDetailArrayList = {};
    }

    // Ensure roomsDetailArrayList[roomID] is defined
    if (!roomsDetailArrayList[roomID]) {
      roomsDetailArrayList[roomID] = {};
    }

    // Ensure roomsDetailArrayList[roomID] is defined
    if (!roomsDetailArrayList[roomID][socketID]) {
      roomsDetailArrayList[roomID][socketID] = {};
    }

    // Ensure roomsDetailArrayList[roomID] is defined
    if (!roomsDetailArrayList[roomID][socketID].score) {
      roomsDetailArrayList[roomID][socketID]["score"] = {};
    }

    roomsDetailArrayList[roomID][socketID]["score"] = scoreCount;
}

function roomInfo(room_id) {

  // Get the number of users in the room
  const roomSockets = io.sockets.adapter.rooms.get(room_id);

  if (roomSockets) {
      const numUsersInRoom = roomSockets.size;
      console.log(`Number of users in room ${room_id}: ${numUsersInRoom}`);
  } else {
      console.log(`Room ${room_id} doesn't exist or has no users.`);
  }
}


function getRandomAvatarLink() {
  // Get a random index from the avatarLink_list
  const randomIndex = Math.floor(Math.random() * avatarLink_list.length);
  // Return the avatar link at the random index
  return avatarLink_list[randomIndex];
}


function createOrUpdateUserInRoom(roomId, userSocketId, userName) {
    
    // Check if the room_id exists in roomsDetailArrayList
    if (!roomsDetailArrayList[roomId]) {
      roomsDetailArrayList[roomId] = {};
    }

    if (!roomsDetailArrayList[roomId][userSocketId]) {
      roomsDetailArrayList[roomId][userSocketId] = {};
    }

    // Create or update the player information in the specified room
    roomsDetailArrayList[roomId][userSocketId] = {
      name: userName,
      score: 0, 
      avatar_link: getRandomAvatarLink()
    };

}


app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/public/index');
  res.render('index', { message: 'This is a dynamic message from the server!' });

});


server.listen(PORT, () => {
  
  colog.log(colog.backgroundGreen('\n\t🦊 server running at http://localhost:3000\t'));


});