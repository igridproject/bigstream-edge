var storage = require('node-persist');
var minimatch = require("minimatch")

var RPCCaller = require('../ipc/rpccaller');

module.exports.createClient = function (cfg)
{
    return new MEM(cfg);
}

var MEM = function (cfg)
{
    this.caller = new RPCCaller({'to':'memservice'});
}

MEM.prototype.get = function (key,callback)
{

    this.caller.call({'method':'get','param':[key]},callback);
    // async function rget(key)
    // {
    //     await storage.init( /* options ... */ );
    //     return await storage.getItem(key);
    // }

    // rget(key).then((v)=> {
    //     if(!v){v=null;}
    //     callback(null,v);
    // });
}

MEM.prototype.set = function (key,v,callback)
{
    this.caller.call({'method':'set','param':[key,v]},callback);
    // async function rset(key,v)
    // {
    //     await storage.init( /* options ... */ );
    //     await storage.setItem(key,v);
    // }

    // rset(key,v).then(()=>{
    //     if(typeof callback == 'function'){
    //         callback();
    //     }
    // });
}

MEM.prototype.del = function (key,callback)
{
    this.caller.call({'method':'del','param':[key]},callback);
    // async function rdel(key)
    // {
    //     await storage.init( /* options ... */ );
    //     await storage.removeItem(key);
    // }

    // rdel(key).then(()=>{
    //     if(typeof callback == 'function'){
    //         callback();
    //     }
    // });
}

MEM.prototype.hset = function (key,id,v,callback)
{
    this.caller.call({'method':'hset','param':[key,id,v]},callback);
    // async function hset(key,id,v)
    // {
    //     await storage.init( /* options ... */ );
    //     var vget = await storage.getItem(key);

    //     var ret = {};
    //     if(vget){
    //         ret=vget;
    //     }
    //     ret[id]=v
    //     await storage.setItem(key,ret);
    // }

    // hset(key,id,v).then(()=>{
    //     if(typeof callback == 'function'){
    //         callback();
    //     }
    // });
}

MEM.prototype.hdel = function (key,id,callback)
{
    this.caller.call({'method':'hdel','param':[key,id]},callback);
    // async function hdel(key,id)
    // {
    //     await storage.init( /* options ... */ );
    //     var vget = await storage.getItem(key);

    //     var ret = {};
    //     if(vget){
    //         ret=vget;
    //     }
    //     delete ret[id];
    //     await storage.setItem(key,ret);
    // }

    // hdel(key,id).then(()=>{
    //     if(typeof callback == 'function'){
    //         callback();
    //     }
    // });
}

MEM.prototype.hget = function (key,id,callback)
{
    this.caller.call({'method':'hget','param':[key,id]},callback);
    // async function hget(key,id)
    // {
    //     await storage.init( /* options ... */ );
    //     var vget = await storage.getItem(key);

    //     if(!vget){
    //         vget={}
    //     }
        
    //     if(vget[id]){
    //         return vget[id];
    //     }else{
    //         return null;
    //     }
    // }

    // hget(key,id).then((v)=>{
    //     callback(null,v);
    // });
}

MEM.prototype.hgetall = function (key,callback)
{
    this.caller.call({'method':'hgetall','param':[key]},callback);
    // async function rget(key)
    // {
    //     await storage.init( /* options ... */ );
    //     return await storage.getItem(key);
    // }

    // rget(key).then((v)=> {
    //     if(!v || typeof v != 'object'){v=null;}
    //     callback(null,v);
    // });
}

MEM.prototype.keys = function (key,callback)
{
    this.caller.call({'method':'keys','param':[key]},callback);
    // async function rkey(key)
    // {
    //     await storage.init( /* options ... */ );
    //     return await storage.keys();
    // }

    // rkey(key).then((v)=> {
    //     var ret = [];
    //     if(v){
    //         v.forEach((k) => {
    //             if(minimatch(k,key)){ret.push(k);}
    //         });
    //     }


    //     callback(null,ret);
    // });
}