var ctx = require('../context');

var RawIPC=require('node-ipc').IPC;

var QScheduler = require('./lib/queue-scheduler');

module.exports.create = function(prm)
{
  var jm = new JM(prm);
  return jm;
}

var JM = function JobMaster (prm)
{
    this.qsch = QScheduler.create();

}

JM.prototype.start = function ()
{
    this.ipc_jobq_start();
    this.ipc_jobservice_start();
}

JM.prototype.ipc_jobservice_start = function ()
{
    var self = this;
    if(self.jobipc){return;}

    self.jobipc=new RawIPC;
    self.jobipc.config.appspace = 'bslink.'
    self.jobipc.config.id = 'jobservice';
    self.jobipc.config.retry= 1500;

    self.jobipc.serve(()=>{

        //Job Request
        self.jobipc.server.on(
            'job.execute_request',
            function (msg,socket){
                if(valid_job_cmd(msg)){
                    self.qsch.job_enqueue({'cmd':msg});
                    self.qsch.match();
                }
            }
        )

    });

    self.jobipc.server.start();
}

JM.prototype.ipc_jobq_start = function ()
{
    var self = this;
    if(self.msipc){return;}

    self.msipc=new RawIPC;
    self.msipc.config.appspace = 'bslink.'
    self.msipc.config.id = 'jobq';
    self.msipc.config.retry= 1500;

    self.msipc.serve(()=>{

        //Processor Queue Request
        self.msipc.server.on(
            'proc.queue_request',
            function (msg,socket){
                if(valid_queue_request(msg)){
                    self.qsch.proc_enqueue({'msg':msg,'socket':socket});
                    self.qsch.match();
                }
            }
        );
        
        //Internal Job Request
        self.msipc.server.on(
            'job.execute_request',
            function (msg,socket){
                if(valid_job_cmd(msg)){
                    self.qsch.job_enqueue({'cmd':msg});
                    self.qsch.match();
                }
            }
        );

    });

    self.msipc.server.start();
}


JM.prototype.match = function () 
{
    var self = this ;
    var mth = self.qsch.match();

    if(mth)
    {
        self.msipc.server.emit(mth.processor.socket,'job.execute',mth.job);
    }
}

function valid_queue_request (data)
{
    if(data && data.object_type && data.object_type=='proc_queue_request')
    {
        return true;
    }

    return false;
}

function valid_job_cmd (data)
{
    if(data && data.object_type && data.object_type=='job_execute' && data.jobId)
    {
        return true;
    }

    return false;
}