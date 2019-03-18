var ctx = require('./context');
var JobMaster = ctx.getLib('jobworker/master');

var service = JobMaster.create({'config':ctx.config,'name':'jobmaster'});
service.start();
