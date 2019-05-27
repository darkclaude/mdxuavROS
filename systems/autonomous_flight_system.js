const rosnodejs = require("rosnodejs");
const server = require("http").createServer();
const io = require("socket.io")(server);
const sha1 = require("sha1");
const geolib = require("geolib");
var rpm = {};

var autonomous_mode = 0;
var mission_loaded = "";
var mission = [];
var mission_isActive = false;
var mission_counter = 0;
var system_enabled = false;
var old_mission_hash = 0;

rosnodejs.initNode("/autonomous_flight_system").then(() => {});

var nav_inputs = {};
const autonomous_nav = rosnodejs.nh;
const pub = autonomous_nav.advertise(
  "/autonomous_flight_system",
  "std_msgs/String"
);

const config_data_sub = autonomous_nav.subscribe(
  "/navigation_config",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
   update_config(data);
  }
);
function update_config(data) { 
}
const nav_data_sub = autonomous_nav.subscribe(
  "/systemData",
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
      updateNAV(data);
    }
  }
);
function updateNAV(msg) {
   nav_inputs = msg;
}

const gamepad_data_sub = autonomous_nav.subscribe(
  "/gamepadData",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    autonomousToggle(data);
  }
);

function autonomousToggle(data) {
  if (data.button == 13 && data.action == 1) {
    var msg = { type: "toggle" };
    pub.publish({ data: JSON.stringify(msg) });
    mission_isActive = true;
    autonomous_mode=2;
  } else if (data.button == 8 || data.button == 9) {
    mission_isActive = false;
  }
}
const mission_data_sub = autonomous_nav.subscribe(
  "/mission_notifications",
  "std_msgs/String",
  msg => {
    try{
    var data = JSON.parse(msg.data);

    var current_mission_hash = sha1(data.mission);
    if (current_mission_hash == old_mission_hash) {
    } else {
      mission_loaded = data.mission;
      mission = JSON.parse(mission_loaded);
      mission_counter = 0;

      old_mission_hash = current_mission_hash;
    }
  }

catch(err){}
  }
);

setInterval(function() {
  switch (autonomous_mode) {
    case 0:
      break;

    case 1:
      break;
    case 2:
      var mission_action="";
      try{
       mission_action =  mission[mission_counter]["a"];
      // console.log(mission);
      }
      catch(err){}
      switch (mission_action) {
        case "TAKEOFF":
          takeoff();
          break;

        case "LAND":
          land();

          break;

        case "NAV":
          navigate();
        //  console.log(navpoint)
          break;
      }
      break;
  }
}, 10);

function navigate() {
  if (mission_isActive) {
  //  console.log(nav_inputs);
  //  console.log(mission_counter[mission_counter])
    var distance_to_wp = geolib.getDistance(
      { latitude: nav_inputs.lat, longitude: nav_inputs.lng },
      {
        latitude: mission[mission_counter].lt,
        longitude: mission[mission_counter].lg
      }
    );
    if (distance_to_wp <= 10) {
      mission_counter = mission_counter + 1;
      if (mission_counter >= mission.length) {
        mission_counter == 0;
      }
    }
    var desired_heading = geolib.getBearing(
      { latitude: nav_inputs.lat, longitude: nav_inputs.lng },
      {
        latitude: mission[mission_counter].lt,
        longitude: mission[mission_counter].lg
      }
    );

    var desired_altitude = mission[mission_counter].h;
    var desired_velocity = mission[mission_counter].v;
    var auto_data = {
      type:"control",
      desired_heading: desired_heading,
      current_heading: nav_inputs.heading,
      desired_altitude: desired_altitude,
      current_altitude: nav_inputs.alt,
      desired_velocity: desired_velocity,
      current_velocity: 500,
      active_waypoint: mission_counter
    };
  //  console.log(auto_data)
    pub.publish({ data: JSON.stringify(auto_data) });
  }
}
