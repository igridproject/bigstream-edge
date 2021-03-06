var util = require('util');
var EventEmitter = require('events').EventEmitter;
var ModbusRTU = require("modbus-serial");
var hash = require('object-hash');
var async = require('async');
var url = require('url');

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

    if(prm.url){
      var ourl = url.parse(prm.url);
      if(ourl.protocol == 'tcp:'){
        this.modbus_host = ourl.hostname;
        this.modbus_port = ourl.port;
      }
    }

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
                "datatype":"hex",
                "delay":500
            }
            "_hashkey":"",
            "_chktime":1562840698946
        }
    */
    this.observ_list.push(obs);
}

PollingTask.prototype.clear = function ()
{
  this.observ_list = [];
}

PollingTask.prototype.run = function ()
{
    var self = this;
    var idx=0;

    self.running = true;
    self.client.connectTCP(self.modbus_host, { port: self.modbus_port },loop);
    function loop(err){
        if(err){
          self.running=false;
          self.emit("conn_error",{});
        }

        async.whilst(
            function () { return self.running; },
            function (next) {
                var obs = self.observ_list[idx];
                idx++;
                if(idx>=self.observ_list.length){idx=0;}

                var curtime = (new Date()).getTime();
                if(!obs._chktime){obs._chktime=0;}
                if(curtime - obs._chktime > obs.param.delay){
                  obs._chktime = curtime;
                  self.client.setID(obs.param.client_id);
                  self._modfunction(obs.param.function_code,obs.param.address,obs.param.register_length,(err,data)=>{
                    
                    if(!err){
                      var hashdata = hash(data.buffer);
                      if(!obs._hashkey){obs._hashkey = hashdata;}
                      if(obs._hashkey != hashdata){
                        var body = {
                          "address" : obs.param.address
                          ,"length": obs.param.register_length
                          ,"client_id" : obs.param.client_id
                          ,"function_code": obs.param.function_code
                          ,"value" : self._getValue(data,obs.param.datatype)
                          ,"raw" : data
                        }
                        self.emit("datachange",{
                          "conn_name":self.name,
                          "obid": obs.obid,
                          "data": body
                        });
                      }
                      obs._hashkey = hashdata;
                    }else{
                      self.running=false;
                      self.emit("conn_error",{});
                    }

                    setImmediate(() => {next()});

                  });

                }else{
                  var tout = 0;
                  if(idx == self.observ_list.length-1){tout=1;}
                  setTimeout(() => { next(); },tout);
                }

            },
            function (err, res) {
              self.client.close();
            }
        );

    }

}

PollingTask.prototype.close = function (cb)
{
    var self=this;
    self.running=false;

    if(self.client.isOpen){
        self.client.close(cb);
    }else{
      cb();
    }
}

PollingTask.prototype._modfunction = function (code,addr,length,cb)
{
  var ret = null;
  var self = this;

  switch(code) {
    case "1":
    case "FC1":
      self.client.readCoils(addr,length,cb);
      break;
    case "2":
    case "FC2":
      self.client.readDiscreteInputs(addr,length,cb);
      break;
    case "3":
    case "FC3":
      self.client.readHoldingRegisters(addr,length,cb);
      break;
    case "4":
    case "FC4":
      self.client.readInputRegisters(addr,length,cb);
      break;
    default:
      cb("Invalid Code");
  }

  return ret;
}

PollingTask.prototype._getValue = function (raw,dt)
{
  var ret = null;
  var buf=raw.buffer;
    switch(dt) {
      case "int":
        ret = buf.readInt32BE();
        break;
      case "uint32":
        ret = buf.readUInt32BE();
        break;
      case "uint16":
        ret = buf.readUInt16BE();
        break;
      case "int16":
        ret = buf.readInt16BE();
        break;
      case "int32":
        ret = buf.readInt32BE();
        break;
      case "double":
        ret = buf.readDoubleBE();
        break;
      case "float":
        ret = buf.readFloatBE();
        break;
      case "buffer":
        ret = buf;
        break;
      case "hex":
        ret = buf.toString('hex');
        break;
      case "array":
        ret = raw.data;
        break;
      default:
        ret = buf;
    }

    return ret;

}


module.exports = PollingTask;