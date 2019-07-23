var Redis = require('redis');
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
        return null;
    }
    var vo = trigger.vo || '';
    if(vo=='$'){vo=''}

    var a = {
        'vo':vo,
        'conn' : trigger.conn,
        'client_id':trigger.client_id,
        'address':trigger.address,
        'register_length':trigger.register_length,
        'function_code':trigger.function_code,
        'datatype':trigger.data_type,
        'delay':trigger.delay,
        'jobid' : trigger.job_id
    }
    if(opt){a.opt = opt}
    return a;
}

function mkConn(prm,opt)
{
    var conn = {
      'type':'tcp',
      'host' : '127.0.0.1',
      'port' : 502,
      'url' : 'tcp://127.0.0.1:502'
    }  



    return a;
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
    var found = false;
    this.regis.forEach( function (val) {
        if(val.vo == rg.vo && val.topic == rg.topic && val.jobid == rg.jobid){
            found = true;
        }
    });

    if(!found){
        this.regis.push(rg);
    }

    function valid(rg)
    {
      var ret=true;
      if(typeof rg.conn != 'object'){return false;}
      //if(typeof rg.conn.host != 'string' || )
    }
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

TriggerRegister.prototype.findJob= function(topic)
{
  var jobs = [];
  this.regis.forEach( function (val) {
    if(val.topic == topic){
      jobs.push(val);
    }
  });

  return jobs;
}

TriggerRegister.prototype.listTopic= function()
{
  var tops = [];
  this.regis.forEach( function (val) {
    if(tops.indexOf(val.topic)){
      tops.push(val.topic);
    }
  });

  return tops;
}
