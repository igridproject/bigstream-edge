var ctx = require('./context');
var MbTrigger = ctx.getLib('triggers/trg-modbus-poll');
var BSCONFIG = ctx.getConfig();

var trg = MbTrigger.create(BSCONFIG);
trg.start();
