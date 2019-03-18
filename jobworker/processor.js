var crypto = require("crypto");
const RawIPC=require('node-ipc').IPC;

var ctx = require('../context');
var cfg = ctx.config;

var JobRegistry = ctx.getLib('lib/edge/job-registry');
var SSCaller = ctx.getLib('lib/axon/rpccaller');
var ACLValidator = ctx.getLib('lib/auth/acl-validator');

var JobTransaction = require('./lib/jobtransaction');
var JobCaller = require('./lib/jobcaller');


var SS_URL = ctx.getUnixSocketUrl('ss.sock');
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

  this.jobcaller = new JobCaller(this);
  this.job_registry = JobRegistry.create();
  this.acl_validator = ACLValidator.create(this.auth_cfg);

  //this.storagecaller = new SSCaller({'url':SS_URL});
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
    self.jobipc.config.retry= 1500;

    self.jobipc.connectTo(
        'jobservice',
        function(){

            self.jobipc.of.jobservice.on(
                'connect',
                function(){
                    self.queue_request();
                }
            );
            
            self.jobipc.of.jobservice.on(
                'job.excute',
                function(data){
                    self.jobipc.log('excute : ', data);
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
        self.jobipc.of.jobservice.emit(
            'proc.queue_request',
            {
                'proc_id'    : self.proc_id,
                'proc_class' : 'generic'
            }
        );
    }
}

JW.prototype.call_job = function (msg)
{
    if(self.jobipc)
    {
        self.jobipc.of.jobservice.emit('job.execute_request',msg);
    }
}


    //   self._execute_job(data,function (err) {

    //   });


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