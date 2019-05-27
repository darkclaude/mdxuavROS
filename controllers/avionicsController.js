module.exports = function(gpio, pidController) {
  const micros = require("microseconds");
  //const gpio = require('pigpio').Gpio;
  var io = require("socket.io-client");
  var socket = io("");
  var params = { angle: 75 };
  var enabled = false;
var imu =  {balanced: 1, roll: 1, pitch: 1};
var auto = {desired_heading: 260,current_heading: 5, desired_altitude: 500, current_altitude: 200};
var stabilize_enabled = false;
var mode = 0;
var elevator = 75;
  var roll1_pidController = new pidController(7, 4, 0.5,15);
 // var auto_roll1_pidController = new pidController(0.15, 0.04, 0.001,25);
  var auto_roll1_pidController = new pidController(5, 2, 0.5,15);
  
  
  var freeze = false;
  
  // k_p, k_i, k_d, dt


  //var engine1_pidController = new pidController(0.05, 0.05, 0.001); // k_p, k_i, k_d, dt
  var e1r = { min: 0, max: 200000 };

  setTimeout(function() {
    socket = io("http://localhost:8003");
    socket.on("connect", function() {
      console.log("Avionics Connected");
    });
    socket.on("event", function(data) {
      //  console.log(data)
    });
    var oldAngle=999;
    socket.on("setAngle", function(data) {
    //  console.log(data)
      params.angle = Math.round(
        map(JSON.parse(data).data["2"], -2000, 2000, 0, 150)
      
      );
      elevator = Math.round(
        map(JSON.parse(data).data["3"], -2000, 2000, 0, 150)
      
      );
   //   console.log(params.angle);
   //   if(olf)


      //  console.log(params);
    });
    socket.on("setIMU", function(data) {
      imu.roll = JSON.parse(data).roll;
      imu.pitch = JSON.parse(data).pitch;
    //  console.log(imu.roll)
     
    });
    socket.on("set_auto_data", function(data) {
     auto = data;
   //  auto_roll1_pidController.reset();
   // console.log(data);
     
    });
    socket.on("toggle_stabilization", function(data) {
     mode=1;
      console.log("Toggling Stabilization: ");
      roll1_pidController.reset();

      //testServo1(75);
     // testServo2(75);
     
    });
    socket.on("toggle_manual", function(data) {
      mode=0;
       console.log("Toggling Manual Mode: ");
 
  
   
  });

  socket.on("toggle_auto_mode", function(data) {
    mode=2;
     console.log("Toggling Auto Mode: ");


 
});

    socket.on("disconnect", function() {});
  }, 3000);

  const servo1 = new gpio(4, { mode: gpio.OUTPUT });
  const servo2 = new gpio(17, { mode: gpio.OUTPUT });
  calibrateServos();


  setTimeout(function() {
    //enabled=true;
    // console.log("PID ENGAGED DANGER");
  }, 10000);
  function calibrateServos() {
    testServo1(75);
    testServo2(75);
  }

  function testServo1(raw) {
    var pulsemap = 0;

    pulsemap = map(raw, 0, 180, 900, 2300);
    //console.log(raw)
    var out = parseInt(pulsemap.toString());
    //   console.log(out)
    servo1.servoWrite(out);

    // engine2.servoWrite(pulsemap);
  }
 

  function testServo2(raw) {
    var pulsemap = 0;

    pulsemap = map(raw, 0, 180, 900, 2300);
    //console.log(raw)
    var out = parseInt(pulsemap.toString());
    //   console.log(out)
    servo2.servoWrite(out);

    // engine2.servoWrite(pulsemap);
  }


 
  setInterval(function() {
     switch(mode){
       case 0:
         manual_mode();
         break;
        
      case  1: 
          stabilization_mode();
          break;


      case 2: 
          autonomous_mode();
          break;








     }
      
        
      
       
    
  }, 10);
  var k = 75;



  function stabilize(){
    stabilize_roll();
   // console.log("called sr")
  }
  var turn_left= false;
  var output =0;
  function autonomous_mode(){
   // var level = imu.balanced;
 
   var a1 = auto.current_heading;
   var a2 = auto.desired_heading;

   var left = (a1-a2)<0?a1-a2+360:a1-a2
   var right = (a2-a1)<0?a2-a1+360:a2-a1;
   
   if(left<right){
    turn_left=true;
    turn_right=false;
   }
   else if(left>right){
    turn_left=false;
    turn_right=true;
   }
   else{
 
}
  var dif=  Math.min(left,right)
    auto_roll1_pidController.setTarget(0); 
    //var  t= auto.current_heading ;
  
    if(Math.abs(dif)<=2){
      auto_roll1_pidController.reset();
      output=0;
      turn_left= true;
      turn_right=true;
    
    }
    else{
    
    var raw_output  = auto_roll1_pidController.update(dif);
    if(raw_output<0){
      raw_output=raw_output*-1;
    }
    var safe_raw =  limit(raw_output);
    output = map(safe_raw,e1r.min,e1r.max,0,75);
  }
 //   console.log(raw_output)
//   var safe_raw =  limit(raw_output);
//   var output = map(safe_raw,e1r.min,e1r.max,0,25);
//   //var output = map(safe_raw,e1p.min,e1p.max,150,0);
//   //console.log(output)
//   if(turn_left && dif>2){
//        k+=output;
//        if(k>180){
//          k=180;
//        }
//        testServo1(150-k);
//        testServo2(150-k);
//   }
//   else if(!turn_left && dif>2){
//     k-=output;
//     if(k<0){
//       k=0;
//       testServo1(150-k);
//       testServo2(150-k);
//     }
//   }
//   else if(dif<=2){
//     k=75;
//     testServo1(150-k);
//     testServo2(150-k);
//  // manual_mode();
//   auto_roll1_pidController.reset();
   
//   }

var roll_output = 75-output;
var servo_output=0;
if(turn_left && turn_right){
  servo_output= 150-75;
  testServo1(servo_output);
  testServo2(servo_output);

} 
else if(turn_right){
  servo_output = Math.round(roll_output);
  testServo1(servo_output);
  testServo2(servo_output);
}
else if(turn_left){
  servo_output = Math.round(150-roll_output);
  testServo1(servo_output);
  testServo2(servo_output);
}
else{}
  
   console.log(" AUTO: "+auto.current_heading+" D "+auto.desired_heading,output);
  }

  function manual_mode(){
    testServo1(params.angle);
    testServo2(params.angle);

    //console.log(params.angle)

  }

  
  function stabilization_mode(){
    if(params.angle==75){
      stabilize();
   //   console("stabb")
      }
      else{
      manual_mode();
      }
  
  }
  var l = false;
  var r = false;
  var output2 =999;
  function stabilize_roll(){
    var level = imu.balanced;
    roll1_pidController.setTarget(level); 
    var  t= imu.roll ;
    if(t<0){
      t=t*-1;
    }

    if(Math.abs(imu.roll-imu.balanced)<=2){
      roll1_pidController.reset();
      output2=0;
    
  
        l=true;
        r =true;
      
    }
    else{ 
    var raw_output  = roll1_pidController.update(t);
    if(raw_output<0){
      raw_output=raw_output*-1;
    }

    var de = imu.roll-imu.balanced;
    if(de<0){
      r =true;
      l=false;
    }
    else {
      l=true;
      r=false;
    }
    
    var safe_raw =  limit(raw_output);
    output2 = map(safe_raw,e1r.min,e1r.max,0,75);
  }
 
  var roll_output = 75-output2;
  var servo_output=0;
  if(l && r){
    servo_output= 150-75;
    testServo1(servo_output);
    testServo2(servo_output);

  } 
  else if(r){
    servo_output = Math.round(roll_output);
    testServo1(servo_output);
    testServo2(servo_output);
  }
  else if(l){
    servo_output = Math.round(150-roll_output);
    testServo1(servo_output);
    testServo2(servo_output);
  }
  else{}
  //console.log(roll_output,servo_output,l,r);

}
  function map(Var, in_min, in_max, out_min, out_max) {
    return ((Var - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  function limit(v) {
    return Math.round(Math.min(e1r.max, Math.max(e1r.min, v)));
  }
};
