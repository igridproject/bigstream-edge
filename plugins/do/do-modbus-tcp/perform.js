var ctx = require('../../../context');
var Utils = ctx.getLib('lib/util/plugin-utils');
var mqtt = require('mqtt')

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

  var modbus_host = param.host
  var modbus_port = parseInt(param.port)
  var modbus_client_id = parseInt(param.client_id)
  var modbus_address = parseInt(param.address)
  var modbus_register_length = (param.register_length)?parseInt(param.register_length):1;
  var modbus_function_code = (param.function_code)?param.function_code:"FC16"

  var prm_value = param.value;


  var ev =  {
    'type' : in_type,
    'meta' : meta,
    'data' : data[idx]
  }
  var v=Utils.vm_execute_text(ev,prm_value);

  if(!err){
    response.success();
  }else{
    console.log(err);
    response.error("publish error");
  }
  

}

function parseVal(val)
{
  var ret = [0];

  if(typeof val == 'string'){
    ret=[];
    val.split(',').forEach((e)=>{
      var nval = (isNaN(Number(e)))?0:Number(e);
      ret.push(nval)
    });
  }

  return ret;
}

module.exports = perform_function;
