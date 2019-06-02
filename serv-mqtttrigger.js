var ctx = require('./context');
var MqttTrigger = ctx.getLib('triggers/trg-mqtt');

var trg = MqttTrigger.create(ctx.config);
trg.start();
