const rosnodejs = require('rosnodejs');
const SerialPort = require('serialport')
const five = require("johnny-five");



var board;

var leds = [];
var nodeReady = false;
var ledstates = [0,0,0];
var ledpins = [8,9,10,11];
var pin_maps = [3,0,1,2];
var notconnected = true;
var ex_gpio_port="";
var pmData = {amps: 0, volts:0};
var inputs ={};
rosnodejs.initNode('/externalGPIOHandler')
.then(() => {
    nodeReady=true;
  // do stuff
});




const ex_gpio_node = rosnodejs.nh;
const std_msgs = rosnodejs.require('std_msgs');
const power_module = ex_gpio_node.advertise("/powermoduleData", "std_msgs/String");
const system_data_sub = ex_gpio_node.subscribe('/systemData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    //console.log(data)
    payload_string = JSON.stringify(data);

  });
  
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
            if( p['productId']=="0043"){
           // portnames.push(p['comName']);
           console.log(p)
           setConnection(p['comName']);
            
            }
          }
         // console.log(portnames);
         
          });
      
      }
      catch(error){
      
      }
    }
    },500);


   function  setConnection(port){
       if(notconnected){
    notconnected = false;
    ex_gpio_port = port;
    board = new five.Board({
        port: ex_gpio_port
      });

      board.on("ready", function() {
        var led = new five.Led(13);
        leds.push(new five.Led(8));
        leds.push(new five.Led(9));
        leds.push(new five.Led(10));
        leds.push(new five.Led(11));
        led.blink(500);
       
      var  batvolt = new five.Sensor({
            pin: "A0",
            freq: 250
          });

          var current = new five.Sensor({
            pin: "A1",
            freq: 250
          });
          batvolt.on("data", function() {
            var x = (this.raw * (5.0 / 1024.0)) * 15.7///0.06369;
           // var current_reading = (x*17.0*10.0)-3.29;
          // console.log(x);
            pmData.volts= x;
          });
          current.on("data", function() {
         //   var x = this.raw * (5.0 / 1024.0) * 15.7;
            var current_reading = this.raw / 7.4
            pmData.amps= current_reading;
          //  console.log(c);
          });
        
        console.log("External GPIO MCU connected");
      });

    

      
    }


    }
 

    const gamepad_data_sub = ex_gpio_node.subscribe('/gamepadData', 'std_msgs/String', (msg) => {
        var data = JSON.parse(msg.data);
        updateInput(data);
      });
      function updateInput(msg){
      inputs=msg;
  console.log(msg)
       for(var i=0; i<pin_maps.length; i++){
           if(pin_maps[i]==msg.button){
              if(msg.action){
                  leds[i].on();
                  break;
              }
              else{
                  leds[i].off();
                  break;
              }
           }
       }
     
      
      }



//const pub = gcsnode.advertise('/gamepadData', 'std_msgs/String');

