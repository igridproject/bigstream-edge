module.exports = {
  "apps" : [ 
  {
    "name"        : "bs.coreservices",
    "script"      : "./serv-coreservices.js"
  },{
    "name"        : "bs.storage.write",
    "script"      : "./serv-storage.js",
	"args"		  : "--process-write"
  },
  {
    "name"        : "bs.storage.read",
    "script"      : "./serv-storage.js",
    "args"		  : "--process-read",
    "exec_mode"   : "cluster",
	  "instances"   : process.env['BS_NUM_STORAGE_RD']||1
  },
  {
    "name"        : "bs.jobmaster",
    "script"      : "./serv-jobmaster.js"
  },
  {
    "name"        : "bs.processor",
    "script"      : "./work-jobprocessor.js",
    "output"      : "/dev/null",
    "error"      : "/dev/null",
	  "exec_mode"   : "cluster",
	  "instances"   : process.env['BS_NUM_PROCESSOR']||2
  },
  {
    "name"        : "bs.api.service",
    "script"      : "./serv-api.js"
  },
  {
    "name"        : "bs.trigger.core",
    "script"      : "./serv-coretrigger.js"
  },
  {
    "name"        : "bs.trigger.httplistener",
    "script"      : "./serv-httplistener.js",
    "exec_mode"   : "cluster",
	  "instances"   : process.env['BS_NUM_HTTP']||1
  }]
}