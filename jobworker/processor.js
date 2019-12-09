var crypto = require("crypto");
const RawIPC = require('node-ipc').IPC;

var ctx = require('../context');
var cfg = ctx.config;

var JobRegistry = ctx.getLib('lib/mems/job-registry');
var ConnCtx = ctx.getLib('lib/conn/connection-context');
//var SSCaller = ctx.getLib('lib/axon/rpccaller');
var SSCaller = ctx.getLib('lib/ipc/rpccaller');
var ACLValidator = ctx.getLib('lib/auth/acl-validator');

var JobTransaction = require('./lib/jobtransaction');
var JobCaller = require('./lib/jobcaller');

var SS_URL = ctx.getClientUrl(19030);
module.exports.create = function(prm)
{
  var jw = new JW(prm);
  return jw;
}

var JW = function JobWorker (prm)
{
  var param = prm || {};
  this.config = param.config || cfg;
  this.auth_cfg = this.config.auth;
  this.instance_name = param.name;
  this.proc_id = prm.id || genId();

  this.conn = ConnCtx.create(this.config);
  this.mem = this.conn.getMemstore();

  this.jobcaller = new JobCaller(this);
  this.job_registry = JobRegistry.create({'redis':this.mem});
  this.acl_validator = ACLValidator.create(this.auth_cfg);

  //url not use for ipc lib
  this.storagecaller = new SSCaller({'url':SS_URL,'name':'storage_request'});
}

JW.prototype.start = function ()
{
  this.ipc_jobq_join();
}

JW.prototype.ipc_jobq_join = function ()
{
    var self = this;
    if(self.jobipc){return;}

    self.jobipc=new RawIPC;
    self.jobipc.config.appspace = 'bslink.'
    self.jobipc.config.id = self.proc_id;
    self.jobipc.config.silent = true;
    self.jobipc.config.retry= 1500;

    self.jobipc.connectTo(
        'jobq',
        function(){

            self.jobipc.of.jobq.on(
                'connect',
                function(){
                    console.log('Processor #' + self.proc_id + ' Connected')
                    self.queue_request();
                }
            );
            
            self.jobipc.of.jobq.on(
                'job.execute',
                function(data){
                  //console.log(data)
                    self._execute_job(data,(err)=>{
                      self.queue_request();
                    })
                }
            );

            self.jobipc.of.jobq.on(
              'proc.requeue',
              function(data){
                self.queue_request();
              }
            );

        }
    );
    

}

JW.prototype.queue_request = function ()
{
    var self = this;
    if(self.jobipc)
    {
        self.jobipc.of.jobq.emit(
            'proc.queue_request',
            {
                'object_type' : 'proc_queue_request',
                'proc_id'    : self.proc_id,
                'proc_class' : 'generic'
            }
        );
    }
}

JW.prototype.call_job = function (msg)
{
    var self = this;
    if(self.jobipc)
    {
        self.jobipc.of.jobq.emit('job.execute_request',msg);
    }
}



JW.prototype._execute_job = function (data,callback)
{
  var self=this;
  var jt = new JobTransaction({'handle':self,'cmd':data});
  jt.run(function(err){
    if(err){
      console.log(err);
    }
    callback();
  });
}

function genId()
{
  var id = crypto.randomBytes(3).toString("hex");
  return "X" + id.toUpperCase();
}