const rosnodejs = require("rosnodejs");
var sha1 = require("sha1");

//rosnodejs.loadAllPackages();
rosnodejs.initNode("/accumulator").then(() => {
  // do stuff
});

var navnodeData = {};
var statusData = { navnode: false, avionics: false };
var payloadA = {};
var old_mission_hash = "";
payloadA["thrustlevel"] = 0;
payloadA["engine1"] = 10;
payloadA["engine2"] = 35;
payloadA["esc1"] = 80;
payloadA["esc2"] = 80;
payloadA["estat"] = "ARMED";
payloadA["battery_volts"] = 0;
payloadA["battery_amps"] = 0;
payloadA["airspeed"] = 200;
payloadA["esc1temp"] = 26;
payloadA["esc2temp"] = 26;
payloadA["battemp"] = 35;
payloadA["envtemp"] = 22;
payloadA["mission"] = "KEEP";
payloadA["navTotalbytes"] = 0;
payloadA["Totalbytes"] = 22;
payloadA["navmode"] = "null";
payloadA["type"] = "telemetry";
payloadA["pitch"] = -99;
payloadA["roll"] = -99;
payloadA["lat"] = 0.0;
payloadA["lng"] = 0.0;
payloadA["altitude"] = -99;
payloadA["hdop"] = -1;
payloadA["sat"] = -1;
// navnodeData["battery"] = "12.5";
// navnodeData["airspeed"] = "0";
payloadA["yaw"] = -1;
payloadA["heading"] = 0;
payloadA["gpsfix"] = "null";

var payload = {};

const mcu_data_acc = rosnodejs.nh;
const pub = mcu_data_acc.advertise("/systemData", "std_msgs/String");
const nodes_status_sub = mcu_data_acc.subscribe(
  "/nodes_status",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    updateStatus(data);
  }
);
function updateStatus(msg) {
  statusData = msg;
}

const joystick_data_sub = mcu_data_acc.subscribe('/joystickData', 'std_msgs/String', (msg) => {
  var data = JSON.parse(msg.data);
  updateThrottle(data);
});
function updateThrottle(data){
  //console.log(data.data)
  payloadA["thrustlevel"]  =  Math.round(map(data.data["7"], -2000, 2000, 100, 0));
}


const powermodule_data_sub = mcu_data_acc.subscribe('/powermoduleData', 'std_msgs/String', (msg) => {
  var data = JSON.parse(msg.data);
  updatePowerData(data);
});

function updatePowerData(data){
  //console.log(data.data)
  payloadA["battery_volts"] = data.volts;
  payloadA["battery_amps"] = data.amps;

}


const rpm_data_sub = mcu_data_acc.subscribe(
  "/rpmData",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    updateRPM(data);
  }
);
function updateRPM(msg) {
  payloadA["engine1"] = msg.engine1;
  payloadA["engine2"] = msg.engine2;
}
var c=0;
const mission_data_sub = mcu_data_acc.subscribe(
  "/mission_notifications",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    
    switch (data.type) {
      case "current":
      
        var current_mission_hash = sha1(data.mission);
        if(current_mission_hash == old_mission_hash) {
          c=c+1;
          if(c==10){
            payloadA["mission"] = "KEEP";
          }
         
        } else {
          payloadA["mission"] = data.mission;
          c=0;
       //   console.log(payloadA["mission"])
          old_mission_hash = current_mission_hash;
        }
        break;

        case "urgent":
          payloadA["mission"] = data.mission;
          c=0;
       
      
        break;
    }
  }
);

const gcs_new_connection_sub = mcu_data_acc.subscribe(
  "/new_gcs",
  "std_msgs/String",
  msg => {
    old_mission_hash = '';
    c=0;
    console.log("Mission Loader GCS reset")
  });

const nav_data_sub = mcu_data_acc.subscribe(
  "/navData",
  "std_msgs/String",
  msg => {
    //  var data =;
    var safe = true;
    try {
      var data = JSON.parse(msg.data.toString());
      // console.log(data.type);
    } catch (err) {
      safe = false;
    }

    if (safe) {
      //  navnodeData = data;
      updateNodeNav(data);
    }
  }
);

function updateNodeNav(msg) {
  navnodeData["navmode"] = msg["md"];
  navnodeData["type"] = msg["t"];
  navnodeData["pitch"] = msg["p"];
  navnodeData["roll"] = msg["r"];
  navnodeData["lat"] = msg["lt"];
  navnodeData["lng"] = msg["lg"];
  navnodeData["altitude"] = msg["a"];
  navnodeData["hdop"] = msg["hd"];
  navnodeData["sat"] = msg["st"];
  // navnodeData["battery"] = "12.5";
  // navnodeData["airspeed"] = "0";
  navnodeData["yaw"] = msg["y"];
  navnodeData["heading"] = msg["b"];
  navnodeData["gpsfix"] = msg["gf"];
}

setInterval(function() {
  //    var msgs = {};
  var sm = Object.keys(statusData);
  var nm = Object.keys(navnodeData);
  // var am = Object.keys(payloadA);

  payloadA["nodeNavs"] = statusData.navnode;
  payloadA["nodeProps"] = statusData.propnode;

  if (nm.length > 1) {
    for (n of nm) {
      payloadA[n] = navnodeData[n];
    }
  }
  pub.publish({ data: JSON.stringify(payloadA) });
}, 5);
function map (Var,in_min, in_max, out_min, out_max) {
  return (Var - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }