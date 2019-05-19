const gpio = require('pigpio').Gpio;
const pidController =  require('node-pid-controller');
 
require('.././sensors/rpm_sensors')(gpio);
require('.././controllers/engineController')(gpio,pidController);