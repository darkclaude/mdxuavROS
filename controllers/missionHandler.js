const rosnodejs = require("rosnodejs");
var redis = require("redis"),
  client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });
var mission = "";
client.on("connect", function() {
  console.log("Redis Connected ");

client.get("mission", function (err, reply) {
    if(err || reply==null){
       console.log("No Mission or Mission Error");
       mission="";
    }
    else{
        mission=reply;
        var res = {type:"current", mission: mission }
        mission_notifications.publish({ data: JSON.stringify(res) });
    console.log("Mission Loaded"); // Will print `OK`

    }
});
 

});

client.on("error", function(err) {
  console.log("Redis Error " + err);
});

rosnodejs.initNode("/missionHandler").then(() => {
  nodeReady = true;
});

const mission_node = rosnodejs.nh;
const std_msgs = rosnodejs.require("std_msgs");

const mission_notifications = mission_node.advertise(
  "/mission_notifications",
  "std_msgs/String"
);


const mission_data_sub = mission_node.subscribe(
  "/mission_commands",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    processComamnds(data);
  }
);
function processComamnds(msg) {
  var res = {};
  switch (msg.type) {
    case "UWP":
      try {

       // var formatted_mission = formatMission(msg.msg);
        client.set("mission", msg.msg);
        res = { type: "commandresponse",state:"success",cmd: "UWP" };
      } catch (error) {
        res = { type: "commandresponse",state:"error", cmd: "UWP" };
      }
    
      mission_notifications.publish({ data: JSON.stringify(res) });
      break;
  
  }
  

  //console.log(JSON.stringify(rpm))
}

function formatMission(m){
var ms = JSON.parse(m)

}


setInterval(function(){
    var res = {type:"current", mission: mission }
    mission_notifications.publish({ data: JSON.stringify(res) });

},1000);

//const pub2 = gamepad_node.advertise('/gamepadData', 'std_msgs/String');
