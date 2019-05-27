const rosnodejs = require('rosnodejs');
const server = require('http').createServer();
const io = require('socket.io')(server);
var rpm = {};
rosnodejs.initNode('/engineHandler')
.then(() => {



});
io.on('connection', client => {
    client.on('event', data => {});
    client.on('disconnect', () => {  console.log("Engine  "+client.id+" disconnected")});
    console.log("Engine "+client.id+" dconnected");
    client.on('engC', data =>{
      console.log(data);
    
         //console.log(rpm.engine1)
    });
  });


 

var rpm = {};
const engineHandler = rosnodejs.nh;
const pub = engineHandler.advertise('/engineConUpdate', 'std_msgs/String');
//const pub = sensorHandler.advertise('/rpmData', 'std_msgs/String');
const joystick_data_sub = engineHandler.subscribe('/joystickData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    updateThrottle(data);
  });
  function updateThrottle(data){
    io.emit('throttleInput',JSON.stringify(data));
}
  const gamepad_data_sub = engineHandler.subscribe('/gamepadData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    updateThrottleToggle(data);
  });

  var old_actionUP = 0;
  var toggle=0;
  //var lastToggle = new Date();
  function updateThrottleToggle(data){
   if(data.button==3 && data.action==1){
 //      console.log(new Date().getMilliseconds() - lastToggle.getMilliseconds());
   // if(new Date().getMilliseconds() - lastToggle.getMilliseconds() >=5000){
   
        io.emit('toggle_throttle_in',data.action);
     //   old_action=data.action;
     toggle =!toggle;
     pub.publish({data :toggle.toString()})
        console.log("Toggling: "+toggle);
    //    lastToggle=new Date();

  //  }

}
if(data.button===2 && data.action==1){
    io.emit('spool',data.action);

    //   old_action=data.action;
}
  }
  
  
const rpm_data_sub = engineHandler.subscribe('/rpmData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    updateRPM(data);
  });
  function updateRPM(msg){
  rpm=msg;
  io.emit('setRPM',JSON.stringify(rpm));
  //console.log(JSON.stringify(rpm))
  
  }
  

  const autonomous_data_sub = engineHandler.subscribe(
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
         io.emit("auto_mode_data", data);
         break;
  
  
    }
  }
  
  const config_data_sub = engineHandler.subscribe(
    "/propulsion_config",
    "std_msgs/String",
    msg => {
      var data = JSON.parse(msg.data);
     update_config(data);
    }
  );
  function update_config(data) { 
   
    }
//rosnodejs.loadAllPackages();
var boot = false;

server.listen(8001);