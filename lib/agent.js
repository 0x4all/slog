const fs = require("fs");
const path = require("path");

 /**
  * config:{
        dir:"",//the directory of the logs
        prefix:"",//the log file name prefix
        interval:1000, //ms, check interval, 
        timeout: 10000, //ms, if a file created  {timeout} ms ago, it will be processed by handler function;
        reserved: 1, //default:1, after a file was processed by the handler, it will be delete from disk. the latest {reserved} files will be reserved.
        handler:(dirname, filename, cb)=>{},
    }
  * @param {{dir,perfix,interval,timeout, reserved, handler:(filepath,cb)=>void}} config 
  */
 function Agent(config){
    this.conf = config;
    this.logging = false;
    this.last_log_time = 0;
 }

 /**
  * 检查当前参数是否正确
  * @param {*} config 
  */
 function _check_config( config ) {
     let exists = fs.existsSync(config.dir);
     if(!exists) {
        console.error("config.dir is not exists");
        return false; 
     }
     if(!config.prefix){
        console.warn("config.prefix is invalid");
     }
     if(!config.interval || config.interval < 0){
        console.warn("config.interval is invalid");
        return false;
     }

     if(!config.timeout || config.timeout < 0){
        console.warn("config.timeout is invalid");
        return false;
     }

     if(!config.handler || !(config.handler instanceof Function)){
        console.warn("config.handler should be a function.");
        return false;
     }
     return true;
 }


 async function _read_dir_files( config) {
    return new Promise((resolve)=>{
        fs.readdir(config.dir, (err, files)=>{
            if(err){
                resolve([]);
                return;
            }
            let r = new RegExp("^"+config.prefix +".*$");
            files = files.filter((filename)=>{
                return r.test(filename);//filename.test(config.pattern);
            })
            resolve(files);
        })
    })
 }

 function _get_lock_file(config){
    return path.resolve(config.dir, ".slogcur_" + config.prefix);
 }

 async function _get_next_log_file(files, config){
    return new Promise((resolve)=>{
        if(files.length == 0){
            resolve(-1);
            return;
        }
        let lockfile = _get_lock_file(config);
        //读取lock
        fs.readFile(lockfile, (err, lastlog)=>{
            if(err){
                resolve(0); //文件不存在，选择第一个开始
                return;
            }
            resolve(files.indexOf(lastlog.toString()) + 1);
        });
    });
 }

 /**
  * 文件的创建后超过 config.timeout 认为已经完成可以收集
  * 用于保证最后一个文件被处理
  * @param {*} filename 
  * @param {*} config 
  */
 async function _is_log_complete(filename, config){
    return new Promise((resolve, reject)=>{
        let fp = config.dir + "/" + filename;
        fs.stat(fp, (err, stats)=>{
            if(err){
                resolve(false);
                return;
            }
            let time = Date.now() - stats.ctimeMs;
            resolve( time > config.timeout );
        });
    });
 }

 async function _write_log_cur(filename, config){
    return new Promise((resolve, reject)=>{
        fs.writeFile(_get_lock_file(config), filename,(err)=>{
            resolve(!err);
        } );
    });
 }

 module.exports = Agent;

 Agent.prototype.collect = function(){
     if(!_check_config( this.conf )){
         return;
     }
    this.conf.dir = path.resolve(this.conf.dir);
    setInterval(async ()=>{
        if(this.logging) {
            if((Date.now() - this.last_log_time)> 10 * this.conf.interval){
                console.warn("the time of handle log  is too long! check if the log handler has called the callback function or no.");
            }
            return;
        }
        this.logging = true;
        this.last_log_time = Date.now();
        //读取目录下的所有文件,匹配 pattern的文件
        let files = await _read_dir_files(this.conf);
        files = files.sort();
        //获取上次发送到哪，找到现在要发送的文件
        let idx = await _get_next_log_file(files, this.conf);
        if(idx < 0 || idx >= files.length)  {
            this.logging = false;
            return;
        }
        if(idx == files.length - 1){
            //剩下最后一个，检查它的stat是否为距离现在已经过了1个timeout
            let complete = await _is_log_complete(files[idx], this.conf);
            if(!complete){
                this.logging = false;
                console.debug("log not complete")
                return;
            }
            console.debug("log is complete, process");
        }
        let filename = files[idx];
        let dirname = this.conf.dir;
        //发送
        this.conf.handler( dirname, filename ,async (err)=>{
            if(err){ 
                this.logging = false;
                return;
            }
            //写入发送标记
            let ok = await _write_log_cur(filename, this.conf);
            if(ok){
                //删除无需保留的文件
                const count = this.conf.reserved || 1;
                var reserved_idx = files.length - count;
                for(let i = 0; i < reserved_idx; ++i){
                    fs.unlink( dirname +"/"+ files[i],()=>{});
                }
            }
            this.logging = false;
        });

    }, this.conf.interval );
 }