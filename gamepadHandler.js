const rosnodejs = require("rosnodejs");

var server2 = require("http").createServer();
const io2 = require("socket.io")(server2);

var io_cloud = require('socket.io-client');
var socket = io_cloud('http://hamideu.herokuapp.com');


socket.on('connect', function () {
  console.log('connected', 'Gateway Connected');
 
  });


socket.on('gamepad_cloud', function (data) {
  const msg = new std_msgs.msg.String();
  msg.data = data;
  pub2.publish(msg);
 
  });

  socket.on('joystick_cloud', function (data) {
    const msg = new std_msgs.msg.String();
    msg.data = data;
    pub1.publish(msg);
   
    });

  socket.on('connect_timeout', (timeout) => {
    console.log('timeout')
  //  in_connection=false;
 console.log('disconnected', 'Connection Timed Out');
  });

  socket.on('disconnect', (timeout) => {
    console.log('Disconnected from cloud')
  //  in_connection=false;
 console.log('disconnected', 'Connection Timed Out');
  });


io2.on("connection", client => {
  client.on("joystick_local", data => {
    const msg = new std_msgs.msg.String();
    msg.data = data;
    pub1.publish(msg);
    //  console.log(JSON.parse(data))
  });
  client.on("gamepad_local", data => {
    const msg = new std_msgs.msg.String();
    msg.data = data;
    pub2.publish(msg);
    //  console.log(JSON.parse(data))
  });
  console.log("Gamepad client in");
});

rosnodejs.initNode("/gamepadHandler").then(() => {
  nodeReady = true;
  // do stuff
});

const gamepad_node = rosnodejs.nh;
const std_msgs = rosnodejs.require("std_msgs");
const pub1 = gamepad_node.advertise("/joystickData", "std_msgs/String");
const pub2 = gamepad_node.advertise("/gamepadData", "std_msgs/String");

server2.listen(4500);
