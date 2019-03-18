var RawIPC=require('node-ipc').IPC;
var thunky = require('thunky');


var TSig = function (prm)
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
            'devservice',
            function ()
            {
                self.ipc.of.devservice.on('connect',function ()
                {  
                    self.opened = true;
                    cb();
                });
            }
        );

    }
}

TSig.prototype.send = function (msg,cb)
{
    var self=this;
    self.open(function(err){
        if(err){
            console.log(err);
        }
        self.ipc.of.devservice.emit('trigger.ctl_signal',msg);
    });
}

TSig.prototype.sub = function (cb)
{
    var self=this;
    self.open(function(err){
        if(err){
            console.log(err);
        }
        self.ipc.of.devservice.on('trigger.ctl_signal',function (msg,socket){
            cb(err,msg);
        });
    });
}

module.exports = TSig ;