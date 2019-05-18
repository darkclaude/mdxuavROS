const rosnodejs = require('rosnodejs');
// rosnodejs.loadAllPackages();
rosnodejs.initNode('/gscHandler')
.then(() => {
  // do stuff
});

const navnode = rosnodejs.nh;
const sub = navnode.subscribe('/chatter2', 'std_msgs/String', (msg) => {
  console.log('Got msg on chatter: %j', msg.data);
});

//const pub = navnode.advertise('/navData', 'std_msgs/String');
