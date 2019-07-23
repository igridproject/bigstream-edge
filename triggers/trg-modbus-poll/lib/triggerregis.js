var Redis = require('redis');
var hash = require('object-hash');
var url = require('url');
const KEYS = 'bs:regis:triggers';
const TRIGGER_TYPE = "modbus-poll";

module.exports.create = function(cfg)
{
  return new TriggerRegister(cfg);
}

module.exports.mkRegis = mkRegis
function mkRegis(trigger,opt)
{
    if(!trigger.conn)
    {
        trigger.conn = {};
    }

    var vo = trigger.vo || '';
    if(vo=='$'){vo=''}

    var a = {
        'vo':vo,
        'client_id':1,
        'address':0,
        'register_length':trigger.register_length || 1,
        'function_code':trigger.function_code || 'FC1',
        'data_type':trigger.data_type || 'hex',
        'delay': 500,
        'jobid' : trigger.job_id
    }

    a.client_id = (parseInt(trigger.client_id).toString() != 'NaN')?parseInt(trigger.client_id):1;
    a.address = (parseInt(trigger.address).toString() != 'NaN')?parseInt(trigger.address):0;
    a.delay = (parseInt(trigger.delay).toString() != 'NaN')?parseInt(trigger.delay):500;

    a.conn = mkConn(trigger.conn);

    if(opt){a.opt = opt}
    return a;
}

function mkConn(prm,opt)
{
    var conn = {
      'url' : 'tcp://127.0.0.1:502',
      'name' : ''
    } 

    if(typeof prm.url == 'string'){conn.url = prm.url;}
    if(typeof prm.name == 'string'){conn.name=prm.name;}

    var o = url.parse(conn.url);
    conn.key = hash(conn.name + '_' + o.href);

    if(o.protocol == 'tcp:' && o.host && o.port){
      conn.host = o.host;
      conn.port = o.port;
    }else{
      conn = null;
    }

    return conn;
}

function TriggerRegister(cfg)
{
  this.config = cfg;

  if(cfg.conn){
    this.mem = Redis.createClient(cfg.conn);
  }else if(cfg.mem){
    this.mem = cfg.mem;
  }else if(cfg.redis){
    this.mem = cfg.redis;
  }else{
    this.mem = null;
  }

  this.regis = [];
}

TriggerRegister.prototype.add = function(rg)
{
    if(!rg){return;}

    this.regis.push(rg);

}

TriggerRegister.prototype.clean = function()
{
  this.regis = [];
}

TriggerRegister.prototype.update = function(cb)
{
  var self=this;
  self.clean()
  self.mem.hgetall(KEYS,function (err,res){
    if(!err && res){

      var ks = Object.keys(res);
      for(var i=0;i<ks.length;i++)
      {
        var k = ks[i];
        var trigger = JSON.parse(res[k]);
        if(trigger.type == TRIGGER_TYPE)
        {
          var reg = mkRegis(trigger);
          self.add(reg);
        }
      }
    }

    cb(err);
  });
}

TriggerRegister.prototype.getRegis = function()
{
  return this.regis;
}
