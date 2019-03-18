var ctx = require('../../context');
var cfg = ctx.config;

//var EvenPub = ctx.getLib('lib/amqp/event-pub');
var TriggerSignal = ctx.getLib('lib/bus/trigger-signal');

module.exports.create = function(cfg)
{
  return new TriggerManager(cfg);
}

function TriggerManager (cfg)
{
  this.config = cfg;
  this.conn = cfg.conn;
  this.mem = this.conn.getMemstore();
  //this.evp = new EvenPub({'url':this.conn.getAmqpUrl(),'name':'bs_trigger_cmd'});
  this.evp = new TriggerSignal();
}

TriggerManager.prototype.reload = function (prm,cb)
{
  var self = this;
  //var topic = 'ctl.trigger.all.reload';
  var msg = {
    'trigger_type' : 'all',
    'cmd' : 'reload',
    'prm' : {'vo':prm.vo}
  }

  self.evp.send(msg);

  if(typeof cb == 'function'){cb(null);}
}
