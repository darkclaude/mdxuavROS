const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline');

var port= new SerialPort('/',{ baudRate: 11500});
var portnames = [];
var nodeReady = false;
var notconnected = true;

setInterval(function(){

  try{
    SerialPort.list(function(err,ports){

   
      for(var p of ports){
       if(true){
        portnames.push(p['comName']);
        console.log(p);
      //  portConnection(p['comName'],250000);
        }
      }
     // console.log(portnames);
     
      });
  
  }
  catch(error){
     console.log(error)
  }

},500);


