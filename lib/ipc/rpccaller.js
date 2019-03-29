var axon = require('axon');
var RawIPC=require('node-ipc').IPC;
var thunky = require('thunky');

function RPCCaller(config)
{
  this.config = config;

  this.url = config.url;
  this.name = config.name || "rpc_queue";
  this.to = config.to || config.name;
  this.remote_function = null;
  this.sock = new RawIPC;

  this.sock.config.appspace = 'bslink.'
  this.sock.config.silent = true;
  this.sock.config.retry= 1500;

  var self = this;

  this.fback = {};
  this.runid = 0;
  this.opened = false;
  this.open = thunky(open);
  this.open();

  function open (cb) {
    self.sock.connectTo(
      self.to,
      function(){

        self.sock.of[self.to].on(
          'connect',
          function ()
          {
            self.opened = true;
            cb();
          }
        );

        self.sock.of[self.to].on(
          'disconnect',
          function ()
          {
            self.opened = false;
          }
        );

        self.sock.of[self.to].on(
          'rpc.reply',
          function (msgrep)
          {
            if(msgrep && msgrep.id && typeof self.fback[msgrep.id] == 'function'){
                self.fback[msgrep.id](msgrep.error,msgrep.rep);
                delete self.fback[msgrep.id];
            }
            
          }
        );

      }
    );
  }

}

RPCCaller.prototype.call = function(req,cb)
{
  var self = this;
  //console.log('CALLING>>>');
    self.open(()=>{
      if(self.opened){
        var msg = {};
        msg.id = 'fn' + self.runid++;
        msg.req = req;
        self.fback[msg.id] = cb;
        self.sock.of[self.to].emit('rpc.request', msg);
      }else{
        cb(new Error('RPC Disconnected'));
      }
    });
}

RPCCaller.prototype.close = function()
{
  this.sock.disconnect(self.to);
}

module.exports = RPCCaller;
