module.exports = function(gpio,pidController) {
const micros = require('microseconds');
//const gpio = require('pigpio').Gpio;
var io= require('socket.io-client');
var socket = io('');
   var params = {ref: 0, input: 0}
   params.ref = 8200;
var enabled = false;
var engine1_pidController = new pidController(0.05, 0.05, 0.001); // k_p, k_i, k_d, dt
var e1p = {min: 0, max: 10000};


setTimeout(function(){  
   socket = io('http://localhost:8001') 
   socket.on('connect', function(){
      console.log("Connected");
    });
    socket.on('event', function(data){
     //  console.log(data)
    });
    socket.on('setRPM', function(data){
     params.input = JSON.parse(data);
   //  console.log(params);
    });
    socket.on('setThrottle', function(data){
       params.ref = JSON.parse(data);
       //console.log(params);
      });
    socket.on('disconnect', function(){});
    



},3000);

const engine1 = new gpio(20, {mode: gpio.OUTPUT});
 
calibrateEngines();

setTimeout(function(){
 enabled=true;
 console.log("PID ENGAGED DANGER");
},10000)


function engine1Set(raw){
var pulsemap = map(raw,0,180,1000,2000);
engine1.servoWrite(pulsemap);
}
function engine2Set(raw){
   var pulsemap = 0;
   if(raw<40){
   }
  
   else{
      pulsemap = map(raw,40,180,1000,2000);
   }
   // engine2.servoWrite(pulsemap);
    }
 function engineSet(raw){
   var pulsemap = 0;
   if(raw<40){
   }
  
   else{
   
      pulsemap = map(raw,40,180,900,2300);
      //console.log(raw)
      var out = parseInt(pulsemap.toString());
      console.log(out)
       engine1.servoWrite(out);
   }
    
    // engine2.servoWrite(pulsemap);
 }

 function engine1PID(data){
   // console.log(data);
   engine1_pidController.setTarget(data.ref); 
  var raw_output  = engine1_pidController.update(data.input.engine1);
 // console.log(raw_output)
var safe_raw =  limit(raw_output);
var output = map(safe_raw,e1p.min,e1p.max,40,120);
//console.log(output)
 engineSet(output);
  console.log("SET: "+data.ref+" SENS: "+data.input.engine1);
 }

 function engine2PID(params){
 
}
 
 function calibrateEngines(){
    setTimeout(function(){
       engineSet(40);
       socket.emit('engC', "Engines Calibrated");
    },3000);   
   } 

setInterval(function(){
   if(enabled){
//engine1PID(params);
   }
},12);

function map (Var,in_min, in_max, out_min, out_max) {
   return (Var - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
   }
   
 function limit(v) {
      return Math.round((Math.min(e1p.max, Math.max(e1p.min, v))));
  }
}
