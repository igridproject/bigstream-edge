var ctx = require('./context');
var MbTrigger = ctx.getLib('triggers/trg-modbus-poll');

var trg = MbTrigger.create(ctx.config);
trg.start();
