var util = require('util');
var EventEmitter = require('events').EventEmitter;
var ModbusRTU = require("modbus-serial");
var async = require('async');

function PollingTask(prm)
{
    EventEmitter.call(this);

    this.client = new ModbusRTU();

    this.name = prm.name;
    this.observ_list = [];
    this.init_time = 0;
    this.running = false;

    this.modbus_host = prm.host;
    this.modbus_port = prm.port;

}
util.inherits(PollingTask, EventEmitter);

PollingTask.prototype.addObserv = function (obs)
{
    /*
        {
            "obid":"",
            "param":{
                "client_id":1,
                "address":1,
                "register_length":10,
                "function_code":"FC3",
                "delay":500
            }
            "_keyflag":"",
            "_chktime":1562840698946
        }
    */
    this.observ_list.push(obs);
}

PollingTask.prototype.run = function ()
{
    var self = this;
    var idx=0;

    self.running = true;
    self.client.connectTCP(self.modbus_host, { port: self.modbus_port },loop);
    function loop(err){
        if(err){self.running=false;}

        async.whilst(
            function () { return self.running; },
            function (next) {
                
                
                next();
            },
            function (err, res) {
    
            }
        );

    }

}

PollingTask.prototype.close = function ()
{
    self.running=false;

    if(self.client.isOpen()){
        self.client.close();
    }
}

PollingTask.prototype._modfunction = function (code,addr,length,cb)
{
  var ret = null;
  var self = this;

  switch(code) {
    case "FC1":
      self.client.readCoils(addr,length,cb);
      break;
    case "FC2":
      self.client.readDiscreteInputs(addr,length,cb);
      break;
    case "FC3":
      self.client.readHoldingRegisters(addr,length,cb);
      break;
    case "FC4":
      self.client.readInputRegisters(addr,length,cb);
      break;
    default:
      cb("Invalid Code");
  }

  return ret;
}

module.exports = PollingTask;