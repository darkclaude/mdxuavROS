const rosnodejs = require("rosnodejs");
const server = require("http").createServer();
const io = require("socket.io")(server);
var rpm = {};
rosnodejs.initNode("/avionicsHandler").then(() => {});
io.on("connection", client => {
  client.on("event", data => {});
  client.on("disconnect", () => {
    console.log("Avionics  " + client.id + " disconnected");
  });
  console.log("Avionics " + client.id + " connected");
  client.on("ok", data => {
    console.log(data);

    //console.log(rpm.engine1)
  });
});

var inputs = {};
const avionicsHandler = rosnodejs.nh;
//const pub = sensorHandler.advertise('/rpmData', 'std_msgs/String');
const joystick_data_sub = avionicsHandler.subscribe(
  "/joystickData",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    updateInput(data);
  }
);
function updateInput(msg) {
  inputs = msg;
  io.emit("setAngle", JSON.stringify(inputs));
  //console.log(JSON.stringify(rpm))
}

const nav_data_sub = avionicsHandler.subscribe(
  "/navData",
  "std_msgs/String",
  msg => {
    var safe = true;
    try {
      var data = JSON.parse(msg.data.toString());
      // console.log(data.type);
    } catch (err) {
      safe = false;
    }

    if (safe) {
      //  navnodeData = data;
      //  updateNodeNav(data);
      updateIMU(data);
    }
  }
);
function updateIMU(msg) {
  var inputs = { roll: msg.r , pitch: msg.p};
  //console.log(inputs);
  io.emit("setIMU", JSON.stringify(inputs));
  //console.log(JSON.stringify(rpm))
}

const gamepad_data_sub = avionicsHandler.subscribe(
  "/gamepadData",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    stabilisedToggle(data);
  }
);

var old_actionUP = 0;
var toggle = false;
//var lastToggle = new Date();
function stabilisedToggle(data) {
  if (data.button == 8 && data.action == 1) {
    //      console.log(new Date().getMilliseconds() - lastToggle.getMilliseconds());
    // if(new Date().getMilliseconds() - lastToggle.getMilliseconds() >=5000){

    //   old_action=data.action;
    //  toggle =!toggle;
    io.emit("toggle_stabilization", "");
  }
  if (data.button == 9 && data.action == 1) {
    //      console.log(new Date().getMilliseconds() - lastToggle.getMilliseconds());
    // if(new Date().getMilliseconds() - lastToggle.getMilliseconds() >=5000){

    //   old_action=data.action;
    //  toggle =!toggle;
    io.emit("toggle_manual", "");
  }
}

const autonomous_data_sub = avionicsHandler.subscribe(
  "/autonomous_flight_system",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    auto_modeToggle(data);
  }
);
function auto_modeToggle(data) {
  switch (data.type) {
     case "toggle":
       io.emit("toggle_auto_mode","");
       break;

    case "control" :
       io.emit("set_auto_data", data);
      // console.log(data)
       break;


  }
}

const config_data_sub = avionicsHandler.subscribe(
  "/avionics_config",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
   update_config(data);
  }
);
function update_config(data) { 
}

//rosnodejs.loadAllPack}ages();
var boot = false;

server.listen(8003);
