var ctx = require('./context');
var JobMaster = ctx.getLib('jobworker/master');

var service = JobMaster.create({'config':ctx.getConfig(),'name':'jobmaster'});
service.start();
