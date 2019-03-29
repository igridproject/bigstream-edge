var RawIPC=require('node-ipc').IPC;

function RPCServer(config)
{
    this.config = config;
    this.url = config.url;
    this.name = config.name || "rpc_queue";
    this.remote_function = null;
    this.sock = new RawIPC;

    this.sock.config.appspace = 'bslink.'
    this.sock.config.id = this.name;
    this.sock.config.silent = true;
    this.sock.config.retry= 1500;
}

RPCServer.prototype.start = function(cb)
{
  var self = this;
  self.sock.serve(()=>{

    //func Request
    self.sock.server.on(
          'rpc.request',
          function (msg,socket){
            if (typeof self.remote_function == 'function'){
              self.remote_function(msg.req,function (err,rep){
                var msgrep = {'id':msg.id}
                if(err){
                  msgrep.error = err;
                }else{
                  msgrep.rep = rep;
                }
                self.sock.server.emit(
                  socket,
                  'rpc.reply',
                  msgrep
                );
              });
            }
          }
      );

  });

  self.sock.server.start();

}

RPCServer.prototype.set_remote_function = function(func){
  this.remote_function = func;
}

module.exports = RPCServer;
