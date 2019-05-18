const rosnodejs = require('rosnodejs');
//rosnodejs.loadAllPackages();
rosnodejs.initNode('/nodeStatus')
.then(() => {
  // do stuff
});

const states = {navnode: false, avionics: false};
const nh = rosnodejs.nh;

const nav_nodeSub = nh.subscribe('/navConUpdate', 'std_msgs/String', (msg) => {
   //  var data = JSON.parse(msg.data);
     states.navnode= msg.data;
     console.log(msg);
});

const avionics_nodeSub = nh.subscribe('/avionicsConUpdate', 'std_msgs/String', (msg) => {
    states.navnode= msg.connected;
});



//const pub = nh.advertise('/chatter2', 'std_msgs/String');

