var ctx = require('../../context');
var ConnCtx = ctx.getLib('lib/conn/connection-context');


var redis = ctx.getLib('lib/edge/bsmem');
const PREFIX = 'bs:jobs';

function memstore(conf){
  this.prefix = PREFIX + ':' + conf.job_id + ':' + conf.cat;

  if(conf.mem){
      this.mem = conf.mem;
  }else if(conf.conn){
    this.mem = ConnCtx.create(ctx.config).getMemstore();
  }
}

memstore.prototype.setItem = function(k,v,cb){
  var key = this.prefix + ":" + k;
  var value = JSON.stringify(v);
  this.mem.set(key,value,cb);
}

memstore.prototype.getItem = function(k,cb)
{
  var key = this.prefix + ":" + k;
  this.mem.get(key,function(err,v){
    var value = null;
    if(!err && v){
      if(typeof v == 'object' && v.type == 'Buffer')
      {
        value = new Buffer(v.data);
      }else{
        value = JSON.parse(v);
      }
    }
    cb(err,value);
  });
}

module.exports = memstore;
