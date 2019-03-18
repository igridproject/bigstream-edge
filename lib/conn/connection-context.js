var Redis = require('redis');
var BSmem = require('../edge/bsmem')

module.exports.create = function(cfg,opt)
{
  var conn = new ConnCtx(cfg,opt);
  return conn;
}

var ConnCtx = function ConnectionContext(cfg,opt)
{
  this.config = cfg;
}

ConnCtx.prototype.getMemstore = function(opt)
{
  if(!this.redis){
    this.redis = BSmem.createClient();
  }

  return this.redis;
}

ConnCtx.prototype.getAmqpUrl = function()
{
  return this.config.amqp.url;
}
