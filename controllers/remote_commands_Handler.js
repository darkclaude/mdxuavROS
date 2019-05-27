const rosnodejs = require("rosnodejs");

rosnodejs.initNode("/remote_commands_Handler").then(() => {
  nodeReady = true;
  // do stuff
});

const command_node = rosnodejs.nh;
const std_msgs = rosnodejs.require("std_msgs");

const mission_commands = command_node.advertise(
  "/mission_commands",
  "std_msgs/String"
);
const avionics_commands = command_node.advertise(
  "/avionics_commands",
  "std_msgs/String"
);
const gpio_commands = command_node.advertise(
  "/gpio_commands",
  "std_msgs/String"
);
const sensor_commands = command_node.advertise(
  "/sensor_commands",
  "std_msgs/String"
);
const flight_system_commands = command_node.advertise(
  "/flight_system_commands",
  "std_msgs/String"
);

const configuration_commands = command_node.advertise(
  "/configuration_commands",
  "std_msgs/String"
);


const command_data_sub = command_node.subscribe(
  "/commandsData",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
    processCommands(data);
  }
);
function processCommands(payload) {
  //  console.log(payload)
  switch (payload.class) {
    case "mission":
      mission_commands.publish({ data: JSON.stringify(payload) });
      console.log(payload);
      break;
    case "avionics":
      avionics_commands.publish({ data: JSON.stringify(payload) });
      break;
    case "gpio":
      gpio_commands.publish({ data: JSON.stringify(payload) });
      break;
    case "sensors":
      sensor_commands.publish({ data: JSON.stringify(payload) });
      break;
    case "fms":
      flight_system_commands.publish({ data: JSON.stringify(payload) });
      break;

      case "configuration":
     config_commands.publish({ data: JSON.stringify(payload) });
      break; 
  
    default:
    // code block
  }
}

//const pub2 = gamepad_node.advertise('/gamepadData', 'std_msgs/String');
