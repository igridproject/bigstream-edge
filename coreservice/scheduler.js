var schedule = require('node-schedule');

var ctx = require('../context');
var cfg = ctx.config;
var amqp_cfg = ctx.config.amqp;

var ConnCtx = ctx.getLib('lib/conn/connection-context');
var CronList = ctx.getLib('lib/mems/cronlist');
var QueueCaller = ctx.getLib('lib/amqp/queuecaller');
var EvenSub = ctx.getLib('lib/amqp/event-sub');
var TriggerSignal = ctx.getLib('lib/bus/trigger-signal');
var JobCaller = ctx.getLib('lib/bus/jobcaller');

module.exports.create = function (cfg)
{
  return new SchedulerService(cfg);
}

function SchedulerService(cfg)
{
  this.config = cfg;

  this.conn = ConnCtx.create(this.config);
  this.mem = this.conn.getMemstore();
  this.jobcaller = new JobCaller();

  //this.jobcaller = new QueueCaller({'url':amqp_cfg.url,'name':'bs_jobs_cmd'});
  //this.evs = new EvenSub({'url':amqp_cfg.url,'name':'bs_trigger_cmd'});
  this.evs = new TriggerSignal();

  this.crons = CronList.create({'redis':this.mem});
  this.engine = [];
}

SchedulerService.prototype.start = function ()
{
  console.log('SCHEDULER:Starting\t\t[OK]');
  this.reload();
  this._start_controller();
}

SchedulerService.prototype.reload = function ()
{
  console.log('SCHEDULER:Reloading CronList\t[OK]');
  var self = this;
  self.clean();
  self.crons.update(function(err){
    var cl = self.crons.list;
    for(var i=0;i<cl.length;i++)
    {
      var c = cl[i];
      var s = schedule.scheduleJob(cl[i].cmd, function(y){
        self._callJob(y);
      }.bind(null,cl[i]));

      self.engine.push({'c':c,'s':s});
    }
    console.log('SCHEDULER:Register ' + String(i) + ' jobs \t[OK]');
  });

}

SchedulerService.prototype.clean = function ()
{
  var arrEngine = this.engine;
  for(var i=0;i<arrEngine.length;i++)
  {
    arrEngine[i].s.cancel();
  }
  this.engine = [];
}

SchedulerService.prototype._callJob = function(cron)
{
  var cmd = {
    'object_type':'job_execute',
    'source' : 'scheduler',
    'jobId' : cron.jobid,
    'option' : {'exe_level':'secondary'},
    'input_data' : {
      'type' : 'bsdata',
      'value' : {
        'data_type' : 'object',
        'data' : {}
      }
    }
  }

  this.jobcaller.send(cmd);
}

SchedulerService.prototype._start_controller = function ()
{
  var self=this;

  self.evs.sub(function(err,msg){
    if(err){
      console.log('SCHEDULER:ERROR Restarting ...');
      setTimeout(function(){
        process.exit(1);
      },5000);
    }

    if(!msg){return;}

    var ctl = msg;
    if(ctl.trigger_type != 'cron' && ctl.trigger_type != 'all')
    {
      return;
    }

    if(ctl.cmd == 'reload')
    {
      console.log('SCHEDULER:CMD Reload\t\t[OK]');
      self.reload();
    }

  });
}
