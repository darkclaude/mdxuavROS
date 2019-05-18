const rosnodejs = require('rosnodejs');
//rosnodejs.loadAllPackages();
rosnodejs.initNode('/my_node2')
.then(() => {
  // do stuff
});

const nh = rosnodejs.nh;
const sub = nh.subscribe('/chatter', 'std_msgs/String', (msg) => {
  console.log('Got msg on chatter: %j', msg);
});

const pub = nh.advertise('/chatter3', 'std_msgs/String');
setInterval(function(){
 //
    //console.log("Sending Hi");
},50);

