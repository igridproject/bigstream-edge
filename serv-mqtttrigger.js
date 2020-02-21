var ctx = require('./context');
var MqttTrigger = ctx.getLib('triggers/trg-mqtt');
var BSCONFIG = ctx.getConfig();

var trg = MqttTrigger.create(BSCONFIG);
trg.start();
