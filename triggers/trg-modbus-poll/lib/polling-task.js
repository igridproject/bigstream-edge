const ModbusRTU = require("modbus-serial");

module.exports.create = function(prm)
{
  return new PollingTask(prm);
}

function PollingTask(prm)
{
    this.client = new ModbusRTU();

    this.name = prm.name;
    this.observ_list = [];
    this.init_time = 0;

}

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