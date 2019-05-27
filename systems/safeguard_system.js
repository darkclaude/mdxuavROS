const rosnodejs = require("rosnodejs");
var sha1 = require("sha1");

//rosnodejs.loadAllPackages();
rosnodejs.initNode("/safeguard_system").then(() => {
  // do stuff
});

var system_data = {};

const safeguard_node = rosnodejs.nh;
const system_data_sub = safeguard_node.subscribe('/systemData', 'std_msgs/String', (msg) => {
  var data = JSON.parse(msg.data);
  updateSystemData(data);
});
const config_data_sub = safeguard_node.subscribe(
    "/safeguard_config",
    "std_msgs/String",
    msg => {
      var data = JSON.parse(msg.data);
     update_config(data);
    }
  );
  function update_config(data) { 
  }


function updateSystemData(data){
 system_data = data;
}

setInterval(function() {
 
}, 10);
function map (Var,in_min, in_max, out_min, out_max) {
  return (Var - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }