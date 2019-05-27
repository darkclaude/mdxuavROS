const rosnodejs = require('rosnodejs');
const rest = require('restler');
//rosnodejs.loadAllPackages();
rosnodejs.initNode('/flightStatus')
.then(() => {
  // do stuff
});


const flight_tracker = rosnodejs.nh;
const pub = flight_tracker.advertise('/liveflight_status', 'std_msgs/String');

const config_data_sub = flight_tracker.subscribe(
  "/flight_tracker_config",
  "std_msgs/String",
  msg => {
    var data = JSON.parse(msg.data);
   update_config(data);
  }
);
function update_config(data) { 
}

setInterval(function(){
    // log.info("HELLO")
    rest.get("https://darkclaude:ninjax12@opensky-network.org/api/states/all?lamin=22.3752&lomin=51.6174&lamax=26.4949&lomax=56.6161").on('complete', function (result) {
    if (result instanceof Error) {
       //console.log('Error:', result.message);
       this.retry(5000); // try again after 5 sec
     } else {
      // console.log(result.states[0]);
     // console.log(result);
     // console.error(result)
       var flightsRaw = result;
       var flights = [];
       try{
   for (var k of flightsRaw.states) {
     var flight = {};
     flight["icao24"] = k[0];
     flight["callsign"] = k[1];
     flight["origin"] = k[2];
     flight["time_position"] = k[3];
     flight["last_contact"] = k[4];
     flight["lng"] = k[5];
     flight["lat"] = k[6];
     flight["baro_alt"] = k[7];
     flight["on_ground"] = k[8];
     flight["velocity"] = k[9];
     flight["heading"] = k[10];
     flight["vertical_speed"] = k[11];
     flight["sensors"] = k[12];
     flight["gps_alt"] = k[13];
     flight["squawk"] = k[14];
     flight["spi"] = k[15];
     flight["pos"] = k[16];
     //console.log(flight["callsign"]+"\n");
     flights.push(flight);
   
   }
       }catch(error){}
   var payloadJson = JSON.stringify(flights);
    pub.publish({data: payloadJson})
 //  win.webContents.send('radar', payloadJson);
   
   //console.log(flights);
   
     }
   });
     
   },50000);
   