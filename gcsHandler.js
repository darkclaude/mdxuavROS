const rosnodejs = require('rosnodejs');
const server = require('http').createServer();
const io = require('socket.io')(server);

io.on('connection', client => {
  client.on('event', data => {});
  client.on('disconnect', () => {  console.log("client out")});
  console.log("client in")
});

rosnodejs.initNode('/gscHandler')
.then(() => {
  // do stuff
});
const gcsnode = rosnodejs.nh;
const system_data_sub = gcsnode.subscribe('/systemData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    streamSocket(data);
  });
  

 function streamSocket(payload) {
    io.emit('data',JSON.stringify(payload))
 }
 server.listen(3500);
 console.log("GCS Handler IO server UP");
//const pub = navnode.advertise('/navData', 'std_msgs/String');
