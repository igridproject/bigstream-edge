var ctx = require('../context');

var RawIPC=require('node-ipc').IPC;

module.exports.create = function(prm)
{
  var dm = new DM(prm);
  return dm;
}

var DM = function DevMaster (prm)
{
    
}

DM.prototype.start = function ()
{
    this.ipc_devservice_start();
    console.log('DevMaster Started');
}

DM.prototype.ipc_devservice_start = function ()
{
    var self = this;
    if(self.ipc){return;}

    self.ipc=new RawIPC;
    self.ipc.config.appspace = 'bslink.'
    self.ipc.config.id = 'devservice';
    self.ipc.config.silent = true;
    self.ipc.config.retry= 1500;

    self.ipc.serve(()=>{

        //xx
        self.ipc.server.on(
            'trigger.ctl_signal',
            function (msg,socket){
                if(true){
                    self.ipc.server.broadcast(
                        'trigger.ctl_signal',msg
                    );
                }
            }
        )

    });
    
    self.ipc.server.start();
}