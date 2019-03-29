var ctx = require('../context');

var storage = require('node-persist');
var minimatch = require("minimatch")
var quickq = require('quickq');

var RPCServ=ctx.getLib('lib/ipc/rpcserver');

module.exports.create = function (prm)
{
    var ms = new MS(prm);
    return ms;
}

var MS = function MemService (prm)
{
    
}

MS.prototype.start = function ()
{
    var self = this;

    async function init(prm)
    {
        return await storage.init( {forgiveParseErrors: false} );
    }

    init().then(()=>{
        self.start_ipc();
        console.log('MemService Started');
    })
}

MS.prototype.start_ipc = function ()
{
    var self = this;
    if(self.rpcserv){
        return;
    }
    self.ioq = quickq(self._persist_cmd,{'concurrency':1});
    self.rpcserv = new RPCServ({'name':'memservice'});
    self.rpcserv.set_remote_function(function (req,cb){
        if(typeof req != 'object' || !req.method || !Array.isArray(req.param)){return cb(new Error('invalid method'))}
        self.ioq.push(req,cb);

    });

    self.rpcserv.start();

}

MS.prototype._persist_cmd = function (req,cb)
{
    var self = this;
    switch(req.method) {
        case 'get':
            _get(req.param,cb);
            break;
        case 'set':
            _set(req.param,cb);
            break;
        case 'del':
            _del(req.param,cb);
            break;
        case 'hset':
            _hset(req.param,cb);
            break;
        case 'hdel':
            _hdel(req.param,cb);
            break;
        case 'hget':
            _hget(req.param,cb);
            break;
        case 'hgetall':
            _hgetall(req.param,cb);
            break;
        case 'keys':
            _key(req.param,cb);
            break;
        default:
            cb(new Error('invalid method'))
    }


    function _get (param,callback)
    {
        var key=param[0];
        async function rget(key)
        {
            return await storage.getItem(key);
        }

        rget(key).then((v)=> {
            if(!v){v=null;}
            callback(null,v);
        });
    }

    function _set (param,callback)
    {
        var key=param[0];
        var v=param[1];
        async function rset(key,v)
        {
            await storage.setItem(key,v);
        }
    
        rset(key,v).then(()=>{
            if(typeof callback == 'function'){
                callback();
            }
        });
    }

    function _del (param,callback)
    {
        var key=param[0];
        async function rdel(key)
        {
            await storage.removeItem(key);
        }

        rdel(key).then(()=>{
            if(typeof callback == 'function'){
                callback();
            }
        });
    }

    function _hset (param,callback)
    {
        var key=param[0];
        var id=param[1];
        var v=param[2];

        async function hset(key,id,v)
        {
            var vget = await storage.getItem(key);

            var ret = {};
            if(vget){
                ret=vget;
            }
            ret[id]=v
            await storage.setItem(key,ret);
        }

        hset(key,id,v).then(()=>{
            if(typeof callback == 'function'){
                callback();
            }
        });
    }

    function _hdel (param,callback)
    {
        var key=param[0];
        var id=param[1];
        async function hdel(key,id)
        {
            var vget = await storage.getItem(key);

            var ret = {};
            if(vget){
                ret=vget;
            }
            delete ret[id];
            await storage.setItem(key,ret);
        }

        hdel(key,id).then(()=>{
            if(typeof callback == 'function'){
                callback();
            }
        });
    }

    function _hget (param,callback)
    {
        var key=param[0];
        var id=param[1];
        async function hget(key,id)
        {
            var vget = await storage.getItem(key);

            if(!vget){
                vget={}
            }
            
            if(vget[id]){
                return vget[id];
            }else{
                return null;
            }
        }

        hget(key,id).then((v)=>{
            callback(null,v);
        });
    }

    function _hgetall (param,callback)
    {
        var key=param[0];

        async function rget(key)
        {
            return await storage.getItem(key);
        }

        rget(key).then((v)=> {
            if(!v || typeof v != 'object'){v=null;}
            callback(null,v);
        });
    }

    function _key (param,callback)
    {
        var key=param[0];
        async function rkey(key)
        {
            return await storage.keys();
        }

        rkey(key).then((v)=> {
            var ret = [];
            if(v){
                v.forEach((k) => {
                    if(minimatch(k,key)){ret.push(k);}
                });
            }

            
            callback(null,ret);
        });
    }

}

MS.prototype.init = async function (prm)
{
    return await storage.init( /* options ... */ );
}