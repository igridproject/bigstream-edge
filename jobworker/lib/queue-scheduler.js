module.exports.create = function (prm)
{
    return new QS(prm);
}

var QS = function (prm)
{
    this.waiting_list = [];
    this.gen_proc_queue = [];

}

QS.prototype.proc_enqueue = function (prm)
{
    var self = this;
    var sock = prm.socket;
    var msg = prm.msg;
    var procq_item = {}

    procq_item.proc_id = msg.proc_id;
    procq_item.proc_class = msg.proc_class;
    procq_item.socket = sock;

    self.gen_proc_queue.push(procq_item);
}

QS.prototype.proc_list = function ()
{
    var ret = []
    this.gen_proc_queue.forEach((itm) => {
        ret.push({'id':itm.proc_id});
    });

    return ret;
}

QS.prototype.job_enqueue = function (prm)
{
    var self = this;

    self.waiting_list.push(prm.cmd);
}

QS.prototype.match = function (prm)
{
    var self = this;
    if(self.waiting_list.length > 0 && self.gen_proc_queue.length > 0 )
    {
        var job = self.waiting_list.shift();
        var processor = self.gen_proc_queue.shift();

        return {'job' : job,'processor' : processor}
    }
    return null;
}

QS.prototype.flush_proc = function ()
{
    this.gen_proc_queue = [];
}