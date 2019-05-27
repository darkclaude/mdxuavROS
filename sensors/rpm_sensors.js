module.exports = function(gpio) {
const micros = require('microseconds');
//const gpio = require('pigpio').Gpio;
var io= require('socket.io-client');
socket = io('');
socket.on('connect', function(){
  console.log("Connected");
});
socket.on('event', function(data){});
socket.on('disconnect', function(){});
const KalmanfFilter = require('kalmanjs');
 var kf = new KalmanfFilter();

setTimeout(function(){  socket = io('http://localhost:8000') },3000);
var rpm  = {engine1: 0,engine2: 0}

const rpm_sensor1 = new gpio(26, {
  mode: gpio.INPUT,
  pullUpDown: gpio.PUD_OFF, 
  edge: gpio.FALLING_EDGE
});

var states = {navnode: false, avionics: false};

var rpm_count1 = 0;
var rpm_micros1 = micros.now();
var rpm_ratio = 4.0;
var readings = [];
var readc = 0;
var l = 5
for(var i =0; i<l; i++){
  readings.push(0);
}
rpm_sensor1.on('interrupt', (level) => {
  rpm_count1= rpm_count1 + 1;
});

function updateRPMEngine1(){
var rpm_freq = 0;
var rpm_period =0;
var rpm_calc =0;
rpm_period = (micros.now() - rpm_micros1) / (1000000/5);
 if(rpm_period >= 1){
     rpm_freq = (rpm_count1 / rpm_period)  * 5;
     if(rpm_freq > 10){
     rpm_calc = (rpm_freq *60)/ rpm_ratio;
     }
     else{
         rpm_calc=0;
     }
     readings[readc] = rpm_calc;
     readc = (readc < l) ? readc=readc+1 : readc=0 ;
     var sum=0;
     var smooth_rpm = 0;
     for(r of readings){
       sum+=r;
     }
    smooth_rpm=sum/l;
   
    rpm.engine1=  kf.filter(smooth_rpm).toFixed(0);
    // console.log(rpm.engine1);
     rpm_count1=0;
     rpm_micros1 = micros.now();
 }
 
} 
setInterval(function(){
updateRPMEngine1();
},1);

setInterval(function(){
  socket.emit("rpm", JSON.stringify(rpm));
  //console.log(rpm);
},5);

function updateRPMEngine2(){
    
} 



}
