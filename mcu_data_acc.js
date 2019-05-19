const rosnodejs = require('rosnodejs');

//rosnodejs.loadAllPackages();
rosnodejs.initNode('/accumulator')
.then(() => {
  // do stuff
});


var navnodeData = {};
var statusData = {};
var payloadA = {};
payloadA['thrustlevel']=5;
payloadA['engine1']=10;
payloadA['engine2']=35;
payloadA['esc1']=80;
payloadA['esc2']=80;
payloadA['estat']="ARMED";
payloadA['battery']=14.8;
payloadA['airspeed']=200;
payloadA['esc1temp']=26;
payloadA['esc2temp']=26;
payloadA['battemp']=35;
payloadA['envtemp']=22;
payloadA['mission']="KEEP";
payloadA['navTotalbytes']=0;
payloadA['Totalbytes']=22;

var payload  = {};

const mcu_data_acc = rosnodejs.nh;
const pub = mcu_data_acc.advertise('/systemData', 'std_msgs/String');
const nodes_status_sub = mcu_data_acc.subscribe('/nodes_status', 'std_msgs/String', (msg) => {
  var data = JSON.parse(msg.data);
  updateStatus(data);
});
function updateStatus(msg){
 statusData = msg;
}

const rpm_data_sub = mcu_data_acc.subscribe('/rpmData', 'std_msgs/String', (msg) => {
    var data = JSON.parse(msg.data);
    updateRPM(data);
  });
  function updateRPM(msg){
   payloadA["engine1"] = msg.engine1;
   payloadA["engine2"] = msg.engine2;
  }
  
const nav_data_sub = mcu_data_acc.subscribe('/navData', 'std_msgs/String', (msg) => {
    
    //  var data =;
    var safe = true;
    try{
      var data = JSON.parse(msg.data.toString());
     // console.log(data.type);
    }
    catch(err){
        safe=false;
    }

    if(safe){
      //  navnodeData = data;
        updateNodeNav(data)
    }
 });

 function updateNodeNav(msg){
    navnodeData = msg;
   }
   
   setInterval(function(){
   //    var msgs = {};
       var sm = Object.keys(statusData);
       var nm = Object.keys(navnodeData);
      // var am = Object.keys(payloadA);
      
         payloadA["nodeNavs"] = statusData.navnode;
         payloadA["nodeProps"] = statusData.avionics;    
      
       for(n of nm){
        payloadA[n] =  navnodeData[n];  
      }
      pub.publish({data : JSON.stringify(payloadA)}); 

   },20);