var ctx = require('../context');

var storage = require('node-persist');
var minimatch = require("minimatch")
var RawIPC=require('node-ipc').IPC;

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
    self.init.then(()=>{
        self.start_ipc();
    })
}

MS.prototype.start_ipc = function ()
{

}


MS.prototype._get = function (key,callback)
{
    async function rget(key)
    {
        return await storage.getItem(key);
    }

    rget(key).then((v)=> {
        if(!v){v=null;}
        callback(null,v);
    });
}

MS.prototype._set = function (key,v,callback)
{
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

MS.prototype._del = function (key,callback)
{
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

MS.prototype._hset = function (key,id,v,callback)
{
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

MS.prototype._hdel = function (key,id,callback)
{
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

MS.prototype._hget = function (key,id,callback)
{
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

MS.prototype._hgetall = function (key,callback)
{
    async function rget(key)
    {
        return await storage.getItem(key);
    }

    rget(key).then((v)=> {
        if(!v || typeof v != 'object'){v=null;}
        callback(null,v);
    });
}

MS.prototype._keys = function (key,callback)
{
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

MS.prototype.init = async function (prm)
{
    await storage.init( /* options ... */ );
}