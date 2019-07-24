var ctx = require('../../context');
var ConnCtx = ctx.getLib('lib/conn/connection-context');

var async = require('async');

var TriggerRegis = require('./lib/triggerregis');
var TriggerSignal = ctx.getLib('lib/bus/trigger-signal');
var JobCaller = ctx.getLib('lib/bus/jobcaller');

var PollingTask = require('./lib/polling-task');

var TRIGGER_TYPE = "modbus-poll";


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

  this.conn_list = {};

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
    // self._callJob(item.jobid,mqttdata);
}

MbTrigger.prototype.reload = function ()
{
  var self = this;
  this.regis.update(function(err){
    if(!err){
      console.log('MBPoll_TRIGGER:REG Update\t\t[OK]');

      var regs = self.regis.getRegis();
      //console.log(regs)
      regs.forEach((e)=>{
        if(!self.conn_list[e.conn.key]){
          self.conn_list[e.conn.key] = new PollingTask({
              'name': e.conn.key,
              'url' : e.conn.url
          });
        }

        self.conn_list[e.conn.key].addObserv({
            "obid":e.jobid,
            "param":{
                "client_id":e.client_id,
                "address":e.address,
                "register_length":e.register_length,
                "function_code":e.function_code,
                "datatype":e.data_type,
                "delay":e.delay
            }
        });

      });

      //Starting
      Object.values(self.conn_list).forEach((tsk)=>{
        tsk.on('datachange',(dat)=>{
          self._callJob(dat.obid,dat.data);
        });

        tsk.on('conn_error',()=>{
          setTimeout(()=>{ if(!tsk.running){tsk.run();} },1000)
        });

        tsk.run();
      });
    }else{
      console.log('MBPoll_TRIGGER:REG Update\t\t[ERR]');
    }

  });


}

MbTrigger.prototype.reset = function ()
{
  this.regis.clean();
  var clist = Object.values(this.conn_list);
  this.conn_list = {};
  async.each(clist,(task,callback)=>{
    task.close((err)=>{
      callback();
    });
  },(err)=>{
    clist=[];
  });
}

MbTrigger.prototype._callJob = function(jobid,dat)
{

  var trigger_data = dat;

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
      self.reset();
      self.reload();
    }

  });
}
