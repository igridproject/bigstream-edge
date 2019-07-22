var ctx = require('../../context');
var mqtt = require('mqtt')

var ConnCtx = ctx.getLib('lib/conn/connection-context');

var TriggerRegis = require('./lib/triggerregis');
var TriggerSignal = ctx.getLib('lib/bus/trigger-signal');
var JobCaller = ctx.getLib('lib/bus/jobcaller');

var PollingTask = require('./lib/polling-task');

var TRIGGER_TYPE = "modbus_poll";


module.exports.create = function (cfg)
{
  return new MbTrigger(cfg);
}

function MbTrigger(cfg)
{
  this.config = cfg;

  this.conn = ConnCtx.create(this.config);
  this.mem = this.conn.getMemstore();
  this.jobcaller = new JobCaller();
  this.evs = new TriggerSignal();

  this.regis = TriggerRegis.create({'mem':this.mem});

  this.conn_list = [];
  this.broker_url = "mqtt://127.0.0.1";

}

MbTrigger.prototype.start = function ()
{
  console.log('MBPoll_TRIGGER:Starting\t\t[OK]');
  this._start_listener();
  this._start_controller();
}

MbTrigger.prototype._start_listener = function ()
{
  console.log('MBPoll_TRIGGER:Starting Listener\t[OK]');
  var self = this;
  self.reset();
  self.reload();

  self.client = mqtt.connect(self.broker_url);

  self.client.on('connect',function (){
    self.client.subscribe('#',function (err) {
      if (!err) {

      }
    });
  });

  self.client.on('message',function (topic, message) {

    if(!message){return;}

    var mqttdata = message.toString();
    var jobs = self.regis.findJob(topic);

    jobs.forEach(function(item){
      self._callJob(item.jobid,mqttdata);
    });

  });

}

MbTrigger.prototype.reload = function ()
{
  var self = this;
  this.regis.update(function(err){
    if(!err){
      console.log('MBPoll_TRIGGER:REG Update\t\t[OK]');
    }else{
      console.log('MBPoll_TRIGGER:REG Update\t\t[ERR]');
    }
  });
}

MbTrigger.prototype.reset = function ()
{
  this.regis.clean();
}

MbTrigger.prototype._callJob = function(jobid,mbdata)
{
  var trigger_data = mbdata

  var cmd = {
    'object_type':'job_execute',
    'source' : 'mobbus-poll_trigger',
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

MbTrigger.prototype._start_controller = function ()
{
  var self=this;

  self.evs.sub(function(err,msg){
    if(err){
      console.log('MBPoll_TRIGGER:ERROR Restarting ...');
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
      console.log('MBPoll_TRIGGER:CMD Reload\t\t[OK]');
      self.reload();
    }

  });
}
