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
const sensorHandler = rosnodejs.nh;
//const pub = sensorHandler.advertise('/rpmData', 'std_msgs/String');
const rpm_data_sub = sensorHandler.subscribe('/rpmData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    updateRPM(data);
  });
  function updateRPM(msg){
  rpm=msg;
  io.emit('setRPM',JSON.stringify(rpm));
  //console.log(JSON.stringify(rpm))
  
  }
  

  
//rosnodejs.loadAllPackages();
var boot = false;

server.listen(8001)