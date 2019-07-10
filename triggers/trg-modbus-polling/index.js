var ctx = require('../../context');
var mqtt = require('mqtt')

var ConnCtx = ctx.getLib('lib/conn/connection-context');

var TriggerRegis = require('./lib/triggerregis');
var TriggerSignal = ctx.getLib('lib/bus/trigger-signal');
var JobCaller = ctx.getLib('lib/bus/jobcaller');


var TRIGGER_TYPE = "mqtt";


module.exports.create = function (cfg)
{
  return new MqttTrigger(cfg);
}

function MqttTrigger(cfg)
{
  this.config = cfg;

  this.conn = ConnCtx.create(this.config);
  this.mem = this.conn.getMemstore();
  this.jobcaller = new JobCaller();
  this.evs = new TriggerSignal();

  this.regis = TriggerRegis.create({'mem':this.mem});

  this.broker_url = "mqtt://127.0.0.1";

}

MqttTrigger.prototype.start = function ()
{
  console.log('MQTT_TRIGGER:Starting\t\t[OK]');
  this._start_listener();
  this._start_controller();
}

MqttTrigger.prototype._start_listener = function ()
{
  console.log('MQTT_TRIGGER:Starting Listener\t[OK]');
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

MqttTrigger.prototype.reload = function ()
{
  var self = this;
  this.regis.update(function(err){
    if(!err){
      console.log('MQTT_TRIGGER:REG Update\t\t[OK]');
    }else{
      console.log('MQTT_TRIGGER:REG Update\t\t[ERR]');
    }
  });
}

MqttTrigger.prototype.reset = function ()
{
  this.regis.clean();
}

MqttTrigger.prototype._callJob = function(jobid,mqttdata)
{
  var trigger_data = mqttdata

  var cmd = {
    'object_type':'job_execute',
    'source' : 'mqtt_trigger',
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

MqttTrigger.prototype._start_controller = function ()
{
  var self=this;

  self.evs.sub(function(err,msg){
    if(err){
      console.log('MQTT_TRIGGER:ERROR Restarting ...');
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
      console.log('MQTT_TRIGGER:CMD Reload\t\t[OK]');
      self.reload();
    }

  });
}
