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
}

JM.prototype.ipc_jobq_start = function ()
{
    var self = this;
    if(self.msipc){return;}

    self.msipc=new RawIPC;
    self.msipc.config.appspace = 'bs.'
    self.msipc.config.id = 'jobq';
    self.msipc.config.retry= 1500;

    self.msipc.serv(()=>{

        //Processor Queue Request
        self.msipc.server.on(
            'proc.queue_request',
            function (msg,socket){
                if(valid_queue_request(data)){
                    self.qsch.proc_enqueue({'msg':msg,'socket':socket});
                }
            }
        )

    });

    self.msipc.start();
}

function valid_queue_request (data)
{
    if(data && data.object_type && data.object_type=='proc_queue_request')
    {
        return true;
    }

    return false;
}