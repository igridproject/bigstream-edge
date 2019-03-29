var ctx = require('./context');
var DevService = ctx.getLib('coreservice/devmaster');
var MemService = ctx.getLib('coreservice/memservice');

var dev = DevService.create(ctx.config);
dev.start();

var mem = MemService.create(ctx.config);
mem.start();