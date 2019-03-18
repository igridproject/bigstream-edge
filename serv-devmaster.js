var ctx = require('./context');
var DevService = ctx.getLib('coreservice/devmaster');

var dev = DevService.create(ctx.config);
dev.start();
