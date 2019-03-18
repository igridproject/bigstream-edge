//JobCaller Wrapper

function JobCaller (handle)
{
    this.processor = handle;
}

JobCaller.prototype.send = function (msg)
{
    this.handle.call_job(msg);

}

module.exports = JobCaller;