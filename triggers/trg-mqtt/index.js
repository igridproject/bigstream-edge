var ctx = require('../../context');

var ConnCtx = ctx.getLib('lib/conn/connection-context');

var TriggerRegis = require('./lib/triggerregis');
var TriggerSignal = ctx.getLib('lib/bus/trigger-signal');
var JobCaller = ctx.getLib('lib/bus/jobcaller');

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

var TRIGGER_TYPE = "mqtt";

var PORT = 19150;
var HOST = '0.0.0.0';

module.exports.create = function (cfg)
{
  return new NBUdpTrigger(cfg);
}

function NBUdpTrigger(cfg)
{
  this.config = cfg;

  this.conn = ConnCtx.create(this.config);
  this.mem = this.conn.getMemstore();
  this.jobcaller = new JobCaller();
  this.evs = new TriggerSignal();

  this.regis = TriggerRegis.create({'mem':this.mem});

}

NBUdpTrigger.prototype.start = function ()
{
  console.log('MQTT_TRIGGER:Starting\t\t[OK]');
  this._start_listener();
  this._start_controller();
}

NBUdpTrigger.prototype._start_listener = function ()
{
  console.log('MQTT_TRIGGER:Starting Listener\t[OK]');
  var self = this;
  self.reset();
  self.reload();

  server.on('listening', function () {
    console.log('MQTT_TRIGGER:Listening\t[OK]');
  });

  server.on('message', function (message, remote) {
    if(!message){return;}

    var udpdata = message.toString();
    var datachunk = udpdata.split(',');
    if(datachunk.length>1)
    {
      var kname = datachunk[0];
      var jobs = self.regis.findJob(kname);
      jobs.forEach(function(item){
        self._callJob(item.jobid,udpdata);
      });
    }
  });

  server.bind(PORT, HOST);
}

NBUdpTrigger.prototype.reload = function ()
{
  this.regis.update(function(err){
    if(!err){
      console.log('NBUDP_TRIGGER:REG Update\t\t[OK]');
    }else{
      console.log('NBUDP_TRIGGER:REG Update\t\t[ERR]');
    }
  });
}

NBUdpTrigger.prototype.reset = function ()
{
  this.regis.clean();
}

NBUdpTrigger.prototype._callJob = function(jobid,udpdata)
{
  var udpmsg = udpdata.substring(udpdata.indexOf(',')+1);
  var trigger_data = {
    'object_type' : 'nbudp_data',
    'udpdata' : udpdata,
    'message' : udpmsg
  }

  var cmd = {
    'object_type':'job_execute',
    'source' : 'nbudp_trigger',
    'jobId' : jobid,
    'option' : {'exe_level':'secondary'},
    'input_data' : {
      'type' : 'bsdata',
      'value' : {
        'object_type':'bsdata',
        'data_type' : 'object',
        'data' : trigger_data
      }
    }
  }

  this.jobcaller.send(cmd);
}

NBUdpTrigger.prototype._start_controller = function ()
{
  var self=this;
  //var topic = 'ctl.trigger.#';
  self.evs.sub(function(err,msg){
    if(err){
      console.log('NBUDP_TRIGGER:AMQP ERROR Restarting ...');
      setTimeout(function(){
        process.exit(1);
      },5000);
    }

    if(!msg){return;}

    var ctl = msg;
    if(ctl.trigger_type != TRIGGER_TYPE && ctl.trigger_type != 'all')
    {
      return;
    }

    if(ctl.cmd == 'reload')
    {
      console.log('NBUDP_TRIGGER:CMD Reload\t\t[OK]');
      self.reload();
    }

  });
}
