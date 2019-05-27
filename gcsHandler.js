const rosnodejs = require('rosnodejs');
const server = require('http').createServer();
const io = require('socket.io')(server);
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline');

var port= new SerialPort('/',{ baudRate: 11500});
var portnames = [];
var nodeReady = false;
var notconnected = true;
var payload_string = "";
var send =false;


rosnodejs.initNode('/gscHandler')
.then(() => {
    nodeReady=true;
  // do stuff
});
const gcsnode = rosnodejs.nh;
const std_msgs = rosnodejs.require('std_msgs');
//const pub = gcsnode.advertise('/gamepadData', 'std_msgs/String');
const pub = gcsnode.advertise('/commandsData', 'std_msgs/String');
const pub2 = gcsnode.advertise('/new_gcs', 'std_msgs/String');

io.on('connection', client => {
  client.on('event', data => {});
  client.on('command', data => {
    pub.publish({data:data })
    console.log("Received Command");
  });
  client.on('new_connection', data => {
    pub2.publish({data:data })
    console.log("Received New Connection");
  });
  client.on('disconnect', () => {  console.log("client out")});
  console.log("client in")
});


const system_data_sub = gcsnode.subscribe('/systemData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    //console.log(data)
    payload_string = JSON.stringify(data);
    streamSocket(data);
    streamSerial(data);
  });
  



 function streamSocket(payload) {
    io.emit('data',JSON.stringify(payload))
 }
 function streamSerial(payload) {
    if(!notconnected){
     send=true;
    
  //  console.log(payload)
    }
}
 setInterval(function(){
    if(nodeReady && notconnected){
      try{
        SerialPort.list(function(err,ports){
    
       
          for(var p of ports){
           if(p['productId']=="ea60"){
            portnames.push(p['comName']);
          //  console.log(p);
            portConnection(p['comName'],250000);
            }
          }
         // console.log(portnames);
         
          });
      
      }
      catch(error){
      
      }
    }
    },500);
    
    
    
    function portConnection(portNo, speed){
      console.log(portNo,speed)
      port = new SerialPort(portNo,{ baudRate: speed });
      parser = port.pipe(new Readline({ delimiter: '#' }));
      
      port.on("open", () => {
        //console.log('serial port open');
        notconnected=false;
        const msg = new std_msgs.msg.String();
        msg.data= (!notconnected).toString();
      //  conpub.publish(msg);
        console.log("Connected to BT Dev MCU");
        setInterval(function(){
         if(send){
             port.write(payload_string);
           //  console.log(payload_string);
             send=false;
         }
        },2)
      });
      parser.on('data', (line) =>{
        //line = line.toString();
      var dnt = false;
 
      var payload = {};
      try{
      ;
    
        const msg = new std_msgs.msg.String();
        //var keys = Object.keys(payload)
       msg.data = line;
   
      }
       catch(err){
         console.error(err)
         dnt =true;
       }
        
    
      });
      
      port.on('error', function(err) {
       console.log('Error: ', err.message);
      // notconnected=true;
      
      })
      port.on('disconnect', function() {
      console.log('disconnected','BT Dev Connection Lost');
      
      })
      port.on('close', function(err) {
        //console.log('Error: ', err.message);
        notconnected = true;
        const msg = new std_msgs.msg.String();
        msg.data= (!notconnected).toString();
    
       console.log('disconnected','BT Dev Disconnected');
      })
    }
   
    
    
 server.listen(3500);

 console.log("GCS Handler IO server UP");
