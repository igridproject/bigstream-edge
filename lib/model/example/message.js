//
//--- BSData ---
//

var bsdata =  {
          'object_type' : 'bsdata',
          'data_type' : 'text,binary,object',
          'encoding' : 'base64',
          'data' : 'data'
       }

//
//--- Storage Service request ---
//

var storage_write_request = {
    'object_type' : 'storage_request',
    'command' : 'write',
    'param' : {
      'storage_name' : 'gcs.file.test',
      'meta' : {'name':'gcs'},
      'data' : {
        'type' : 'bsdata',
        'value' : bsdata
      }
    }
}

var httpdata = {
  'object_type' : 'httpdata',
  'method' : 'get,post',
  'data' : {}
}

var job_execute = {
  'object_type':'job_execute',
  'source' : 'http_listener',
  'jobId' : 'jobid',
  'option' : {},
  'input_data' : {
    'type' : 'bsdata',
    'value' : {
      'data_type' : 'object',
      'data' : httpdata
    }
  }
}

var cron = {
  'name':'job01',
  'cron':'*/10 * * * * *',
  'jobid':'job01'
}

var trigger_cmd = {
  'trigger_type' : 'cron',
  'cmd' : 'reload',
  'param':{}
}


//Job Master Scheduler
var proc_queue_request = {
  'object_type':'proc_queue_request',
  'proc_id':'',
  'proc_class':'generic'
}