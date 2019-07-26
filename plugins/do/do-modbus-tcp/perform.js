var ctx = require('../../../context');
var Utils = ctx.getLib('lib/util/plugin-utils');

const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

var async = require('async');

function perform_function(context,request,response){
  var job_id = context.jobconfig.job_id;
  var transaction_id = context.transaction.id;
  var param = context.jobconfig.data_out.param;
  var memstore = context.task.memstore;

  var in_type = request.type;
  var data = request.data;
  var meta = request.meta;

  var modbus_host = param.host||"127.0.0.1";
  var modbus_port = parseInt(param.port)||502;
  var modbus_client_id = parseInt(param.client_id)
  var modbus_address = parseInt(param.address)
  var modbus_register_length = (param.register_length)?parseInt(param.register_length):1;
  var modbus_function_code = (param.function_code)?param.function_code:"FC16"

  var modValue = [];

  if(param.value){
    var prm_value = param.value;
    if(typeof param.value == 'string'){
      var ev =  {
        'type' : in_type,
        'meta' : meta,
        'data' : data
      }
      prm_value=Utils.vm_execute_text(ev,param.value);
    }
    modValue = parseVal(prm_value);
  }else{
    modValue = parseVal(data);
  }

  client.connectTCP(modbus_host, { port: modbus_port },function(err){
    client.setID(modbus_client_id);

	  modbus_function (modbus_function_code,modbus_address, modbus_register_length,modValue, function(err) {
      if(!err){
        response.success();
      }else{
        console.log(err);
        response.error("modbus write error");
      }
    });

  });

  function modbus_function(code,addr,length,val,cb)
  {
    var ret = null;

    switch(code) {
      case "5":
      case "FC5":
        client.writeCoil(addr,mkModValue(val,0),cb);
        break;
      case "15":
      case "FC15":
        client.writeCoils(addr,mkModValue(val,length),cb);
        break;
      case "6":
      case "FC6":
        client.writeRegister(addr,mkModValue(val,0),cb);
        break;
      case "16":
      case "FC16":
        client.writeRegisters(addr,mkModValue(val,length),cb);
        break;
      default:
        cb("Invalid Code");
    }

    return ret;
  }
  

}

function mkModValue(arr,length)
{
  ret = arr[0];
  
  if(length > 0){
    ret=[];
    for(var i=0;i<length;i++)
    {
      if(i<arr.length){
        ret.push(arr[i]);
      }else{
        ret.push(0);
      }
    }
  }

  return ret;
}

function parseVal(val)
{
  var ret = [0];

  if(typeof val == 'string'){
    ret=[];
    val.split(',').forEach((e)=>{
      if(e=='true'){e=1;}
      var nval = (isNaN(Number(e)))?0:Number(e);
      ret.push(nval)
    });

    return ret;
  }

  if(typeof val == 'number')
  {
    ret = [val];
    return ret;
  }

  if(typeof val == 'boolean')
  {
    ret = [Number(val)];
    return ret;
  }

  if(typeof val == 'object')
  {
    ret=[];
    if(Array.isArray(val)){
      val.forEach((v)=>{
        ret.push(parseVal(v)[0]);
      });
    }else if(val.value){
      ret = parseVal(val.value);
    }
  }

  return ret;
}

module.exports = perform_function;
