const rosnodejs = require('rosnodejs');
//rosnodejs.loadAllPackages();
rosnodejs.initNode('/nodeStatus')
.then(() => {
  // do stuff
});

var states = {navnode: false, avionics: false};
const nh = rosnodejs.nh;
const pub = nh.advertise('/nodes_status', 'std_msgs/String');
pub.publish({data : JSON.stringify(states)})

const status_nav_nodeSub = nh.subscribe('/navConUpdate', 'std_msgs/String', (msg) => {
    //  var data = JSON.parse(msg.data);
      states.navnode= msg.data;
      pub.publish({data : JSON.stringify(states)})
      console.log(states);
 });
const avionics_nodeSub = nh.subscribe('/avionicsConUpdate', 'std_msgs/String', (msg) => {
    states.avionics= msg.data;
    pub.publish({data : JSON.stringify(states)})
});





