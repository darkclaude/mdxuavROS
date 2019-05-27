module.exports = function(gpio,pidController) {
const micros = require('microseconds');
var io= require('socket.io-client');
var socket = io('');
   var params = {ref: 0, input: 0}
   var engine_throttle_manual = 0;

var enabled = false;
var modes =0;
var throttle_in_enabled = false;
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
-
    socket.on('auto_mode_data', function(data){
      params.ref = data.desired_velocity;
      mode=2;
    //  console.log(params);
     });

 

    socket.on('toggle_throttle_in', function(data){
      throttle_in_enabled =!throttle_in_enabled;
      mode=0;
      if(!throttle_in_enabled){
         engine_throttle_manual =40;
         
      }
      });
var spooling=false;
      socket.on('spool', function(data){
       
           // spooling=!spooling;
            mode=1
          
      //   }
         });
    //  var oldThrottle=999;
    socket.on('throttleInput', function(data){
     // params.ref = JSON.parse(data);
      if(throttle_in_enabled && !spooling){
        engine_throttle_manual=  Math.round(map(JSON.parse(data).data["7"], -2000, 2000, 180, 35));
      //  console.log(engine_throttle);
      // if(engine_throttle!=oldThrottle){
   
      // oldThrottle=engine_throttle;
      // }
      }
     
     
      //console.log(params);
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
   
    function engineSetRaw(raw){
      pulsemap = map(raw,35,180,900,1200);
      //console.log(raw)
      var out = parseInt(pulsemap.toString());
          engine1.servoWrite(out);
     
       
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
     // console.log(out)
       engine1.servoWrite(out);
   }
    
    // engine2.servoWrite(pulsemap);
 }

 function engine1PID(data){
   // console.log(data);
   if(!throttle_in_enabled){
   engine1_pidController.setTarget(data.ref); 
  var raw_output  = engine1_pidController.update(data.input.engine1);
 // console.log(raw_output)
var safe_raw =  limit(raw_output);
var output = map(safe_raw,e1p.min,e1p.max,40,120);
//console.log(output)
 engineSet(output);
  console.log("SET: "+data.ref+" SENS: "+data.input.engine1);
   }
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
   switch(modes){
      case 0:
        manual_mode();
        break;

     case 1: 
        spooling_mode();
        break;
 
     case  2: 
        auto_mode();
         break;
   }
},10);


function manual_mode(){
   engineSetRaw(engine_throttle_manual);
}

function auto_mode(){
   engine1PID(params);
}

function spooling_mode(){
   engineSetRaw(35); 
}
function map (Var,in_min, in_max, out_min, out_max) {
   return (Var - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
   }
   
 function limit(v) {
      return Math.round((Math.min(e1p.max, Math.max(e1p.min, v))));
  }
}
