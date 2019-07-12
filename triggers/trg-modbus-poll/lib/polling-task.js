var util = require('util');
var EventEmitter = require('events').EventEmitter;
var ModbusRTU = require("modbus-serial");


function PollingTask(prm)
{
    EventEmitter.call(this);

    this.client = new ModbusRTU();

    this.name = prm.name;
    this.observ_list = [];
    this.init_time = 0;

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

}

PollingTask.prototype.close = function ()
{

}

module.exports = PollingTask;