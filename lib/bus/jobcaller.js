var RawIPC=require('node-ipc').IPC;
var thunky = require('thunky');


var JobCaller = function (prm)
{
    this.ipc = new RawIPC;
    this.ipc.config.appspace = 'bslink.'
    this.ipc.config.silent = true;
    this.ipc.config.retry= 1500;


    var self = this;

    this.opened = false;
    this.open = thunky(open);
    this.open();

    function open(cb)
    {
        self.ipc.connectTo(
            'jobservice',
            function ()
            {
                self.ipc.of.jobservice.on('connect',function ()
                {  
                    self.opened = true;
                    cb();
                });
            }
        );

    }
}

JobCaller.prototype.send = function (msg,cb)
{
    var self=this;
    self.open(function(err){
        if(err){
            console.log(err);
        }
        self.ipc.of.jobservice.emit('job.execute_request',msg);
    });
}

module.exports = JobCaller;