const rosnodejs = require("rosnodejs");
var sha1 = require("sha1");
var redis = require("redis"),
  client = redis.createClient();

//rosnodejs.loadAllPackages();

rosnodejs.initNode("/configuration_system").then(() => {
  // do stuff
});

const  configuration_node = rosnodejs.nh;
const pubA = configuration_node.advertise(
    "/avionics_config",
    "std_msgs/String"
  );
  const pubB = configuration_node.advertise(
    "/safeguard_config",
    "std_msgs/String"
  );
  const pubC = configuration_node.advertise(
    "/propulsion_config",
    "std_msgs/String"
  );

  const pubD =configuration_node.advertise(
    "/navigation_config",
    "std_msgs/String"
  );
  const pubE = configuration_node.advertise(
    "/sensors_config",
    "std_msgs/String"
  );
  const pubF= configuration_node.advertise(
    "/flight_tracker_config",
    "std_msgs/String"
  );

client.on("connect", function() {
  console.log("Configuration Redis Connected ");

client.get("avionics_config", function (err, reply) {
    if(err || reply==null){
       console.log("No Avionics_config /Error");
       
    }
    else{
        pubA.publish({data: reply.toString()});
     
    }
});

client.get("safeguard_config", function (err, reply) {
    if(err || reply==null){
       console.log("No Safeguard_config /Error");
       
    }
    else{
        pubB.publish({data: reply.toString()});
     
    }
});

client.get("propulsion_config", function (err, reply) {
    if(err || reply==null){
       console.log("No Propulsion_config /Error");
       
    }
    else{
        pubC.publish({data: reply.toString()});
     
    }

});
client.get("navigation_config", function (err, reply) {
    if(err || reply==null) {
       console.log("No Navigation_config Error");
       
    }
    else{
        pubD.publish({data: reply.toString()});
     
    }
});
client.get("sensors_config", function (err, reply) {
    if(err || reply==null){
       console.log("No Sensors_config /Error");
       
    }
    else{
        pubE.publish({data: reply.toString()});
     
    }

});
 
client.get("flight_tracker_config", function (err, reply) {
    if(err || reply==null){
       console.log("No Flight_tracker_config /Error");
       
    }
    else{
        pubF.publish({data: reply.toString()});
     
    }

});

});

client.on("error", function(err) {
  console.log("Redis Error " + err);
});




const config_data_sub = configuration_node.subscribe('/configuration_commands', 'std_msgs/String', (msg) => {
  var data = JSON.parse(msg.data);
  updateConfigData(data);
});



function updateConfigData(data){
// system_data = data;
}

setInterval(function() {
 
}, 10);
function map (Var,in_min, in_max, out_min, out_max) {
  return (Var - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }