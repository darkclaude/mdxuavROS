const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline');
const rosnodejs = require('rosnodejs');
// rosnodejs.loadAllPackages();
var port= new SerialPort('/',{ baudRate: 11500});
var portnames = [];
var nodeReady = false;
var notconnected = true;
var dc = 0;
rosnodejs.initNode('/navNode')
.then(() => {
nodeReady=true;
});

const navnode = rosnodejs.nh;
const std_msgs = rosnodejs.require('std_msgs');
const sub = navnode.subscribe('/chatter2', 'std_msgs/String', (msg) => {
  console.log('Got msg on chatter: %j', msg.data);
});

const navpub = navnode.advertise('/navData', 'std_msgs/String');
const conpub = navnode.advertise('/navConUpdate', 'std_msgs/String');
setInterval(function(){
if(nodeReady && notconnected){
  try{
    SerialPort.list(function(err,ports){
     // var debug = require('debug')
   //   debug(ports)
   
  // process.stdout.write("new line");
   // console.log(ports);
 
     // var portnames =[];
   
      for(var p of ports){
        if(p['comName'].toLowerCase().indexOf("com")>=0 || p['comName'].toLowerCase().indexOf("usb0")>=0){
        portnames.push(p['comName']);
        portConnection(p['comName'],250000);
        }
      }
     // console.log(portnames);
     
      });
  
  }
  catch(error){
  
  }
}
},2000);

function publishData(payload){
  //pub.publish({ data: "METOO" });
   navpub.publish(payload);
    //console.log(payload);
  
 
}

function portConnection(portNo, speed){
  console.log(portNo,speed)
  port = new SerialPort(portNo,{ baudRate: speed });
  parser = port.pipe(new Readline({ delimiter: '#' }));
  
  port.on("open", () => {
    //console.log('serial port open');
    notconnected=false;
    const msg = new std_msgs.msg.String();
    msg.data= (!notconnected).toString();
    conpub.publish(msg);
    console.log("Connected to Nav Node MCU");
  });
  parser.on('data', (line) =>{
    //line = line.toString();
  var dnt = false;
  //console.log(line);
  //console.log(line);
  var payload = {};
  try{
    dc++;
  //console.log(dc);
 // console.log(JSON.parse(line))
  //  payload = JSON.parse(line);
   // var payloadJson = JSON.stringify(payload);
    const msg = new std_msgs.msg.String();
    //var keys = Object.keys(payload)
   msg.data = line;
   //console.log(line.toString());
   publishData(msg);


   // console.log(payload);
   
  }
   catch(err){
     console.error(err)
     dnt =true;
   }
    

  });
  
  port.on('error', function(err) {
   console.log('Error: ', err.message);
   notconnected=true;
   const msg = new std_msgs.msg.String();
   msg.data= (!notconnected).toString();
    conpub.publish(msg);
  })
  port.on('disconnect', function() {
  console.log('disconnected','Device Connection Lost');
  notconnected=true;
  const msg = new std_msgs.msg.String();
  msg.data= (!notconnected).toString();
  conpub.publish(msg);
  })
  port.on('close', function(err) {
    //console.log('Error: ', err.message);
    notconnected = true;
    const msg = new std_msgs.msg.String();
    msg.data= (!notconnected).toString();
    conpub.publish(msg);
   console.log('disconnected','Device Disconnected');
  })
}



