var ctx = require('./context');
var DevService = ctx.getLib('coreservice/devmaster');
var MemService = ctx.getLib('coreservice/memservice');

var dev = DevService.create(ctx.getConfig());
dev.start();

var mem = MemService.create(ctx.getConfig());
mem.start();