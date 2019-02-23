const {Agent} = require("../");
const path = require("path");

var agent = new Agent({
    dir:path.resolve(__dirname, "../logs"),
    prefix:"dateFileTest",
    interval:1000,
    timeout: 6000, 
    // reserved: 1,
    handler:(dirname, filename, done)=>{
        console.info("collect log file:", dirname, filename);
        done();
    },
})

agent.collect();