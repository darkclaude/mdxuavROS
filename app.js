const rosnodejs = require('rosnodejs');
rosnodejs.loadAllPackages();
rosnodejs.initNode('/my_node')
.then(() => {
  // do stuff
});

const nh = rosnodejs.nh;
const sub = nh.subscribe('/chatter2', 'std_msgs/String', (msg) => {
  console.log('Got msg on chatter: %j', msg.data);
});

const pub = nh.advertise('/chatter', 'std_msgs/String');

