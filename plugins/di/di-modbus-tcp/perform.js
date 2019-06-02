const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

function execute_function(context,response){
  var param = context.jobconfig.data_in.param;

  var modbus_host = param.host
  var modbus_port = parseInt(param.port)
  var modbus_client_id = parseInt(param.client_id)
  var modbus_address = parseInt(param.address)
  var modbus_register_length = (param.register_length)?parseInt(param.register_length):2;
  var modbus_function_code = (param.function_code)?param.function_code:"FC3"

  var modbus_datatype = (param.datatype)?param.datatype:"hex";


  var output_type = 'object';

  
  client.connectTCP(modbus_host, { port: modbus_port },function(err){
    client.setID(modbus_client_id);

	  modbus_function (modbus_function_code,modbus_address, modbus_register_length, function(err, data) {
      if(!err){
        var body = {
          "address" : modbus_address
          ,"length": modbus_register_length
          ,"client_id" : modbus_client_id
          ,"function_code": modbus_function_code
          ,"value" : getValue(data.buffer,modbus_datatype)
          ,"raw" : data
        }
        response.success(body,output_type);
      }else{
        console.log(err)
        response.reject();
      }
    });

  });

  function modbus_function(code,addr,length,cb)
  {
    var ret = null;
    switch(code) {
      case "FC1":
        client.readCoils(addr,length,cb);
        break;
      case "FC2":
        client.readDiscreteInputs(addr,length,cb);
        break;
      case "FC3":
        client.readHoldingRegisters(addr,length,cb);
        break;
      case "FC4":
        client.readInputRegisters(addr,length,cb);
        break;
      default:
        cb("Invalid Code");
    }

    return ret;
  }

}

function getValue(buf,dt)
{
  var ret = null;
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
      default:
        ret = buf;
    }

    return ret;

}

module.exports = execute_function;
