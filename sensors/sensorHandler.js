const rosnodejs = require('rosnodejs');
const server = require('http').createServer();
const io = require('socket.io')(server);
var rpm = {};
rosnodejs.initNode('/sensorHandler')
.then(() => {



});
const sensorHandler = rosnodejs.nh;
const pub = sensorHandler.advertise('/rpmData', 'std_msgs/String');
io.on('connection', client => {
    client.on('event', data => {});
    client.on('disconnect', () => {  console.log("Sensor "+client.id+" disconnected")});
    console.log("Sensor "+client.id+" dconnected");
    client.on('rpm', data =>{
         rpm  = JSON.parse(data);
         pub.publish({data: JSON.stringify(rpm)});
         //console.log(rpm.engine1)
    });
  });
  const config_data_sub = sensorHandler.subscribe(
    "/sensors_config",
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


server.listen(8000)