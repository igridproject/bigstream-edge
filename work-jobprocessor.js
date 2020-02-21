var crypto = require("crypto");
var ctx = require('./context');
var JobWorker = ctx.getLib('jobworker/processor');

var BSCONFIG = ctx.getConfig();
var worker = JobWorker.create({'config':BSCONFIG,'name':'processor',id:genId()});
worker.start();

function genId()
{
  var id = crypto.randomBytes(3).toString("hex");
  return "X" + id.toUpperCase();
}