const modbus = require('jsmodbus')
const SerialPort = require('serialport')
const options = {
    baudRate: 9600
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const commSpecVer = "KS-X-3267:2021";

const itemSpec = {
    status : {
        size : 1,
        type : 'uint16'
    },
    opid : {
        size : 1,
        type : 'uint16'
    },
    control : {
        size : 1,
        type : 'uint16'
    },
    value : {
        size : 2,
        type : 'float'
    },
    'state-hold-time' : {
        size : 2,
        type : 'uint32'
    },
    position : {
        size : 1,
        type : 'uint16'
    },
    'remain-time' : {
        size : 2,
        type : 'uint32'
    },
    opentime : {
        size : 1,
        type : 'uint16'
    },
    closetime : {
        size : 1,
        type : 'uint16'
    },
    ratio : {
        size : 1,
        type : 'int16'
    },
    area : {
        size : 1,
        type : 'uint16'
    },
    alert : {
        size : 1,
        type : 'uint16'
    },
    operation : {
        size : 1,
        type : 'uint16'
    },
    time : {
        size : 2,
        type : 'uint32'
    },
    'hold-time' : {
        size : 2,
        type : 'uint32'
    },
    'on-sec' : {
        size: 2,
        type: 'uint32'
    },
    'start-area' : {
        size : 1,
        type : 'uint16'
    },
    'stop-area' : {
        size : 1,
        type : 'uint16'
    },
    EC : {
        size : 2,
        type : 'float'
    },
    pH : {
        size : 2,
        type : 'float'
    },
    epoch : {
        size : 2,
        type : 'uint32'
    },
    vfloat : {
        size : 2,
        type : 'float'
    },
    vint : {
        size : 1,
        type : 'uint16'
    }
}

let regmap = {};

function printUsage() {
    console.log('Usage:');
    console.log('1. show all serialports in this device:');
    console.log('   $node serialserver.js list');
    console.log('2. start serialport server:');
    console.log('   $node serialserver.js \'serialport path\' \'device spec json\'');
    console.log('   ex) $node serialserver.js /dev/ttyUSB0 ./nodespec.json');
}

function randomMinMax(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomVal() {
    return randomMinMax(1, 9);
    //return 3;
}

function printSerialPorts() {
    SerialPort.list().then((value) => {
        for(let i=0; i<value.length; i++) {
            let port = value[i];
            if (port.path.toLowerCase().indexOf('usb') > 0) {
                console.log(port);
                console.log('-----------------------------------------------------');
            }
        }
    });
}

function printCmdUsage() {
    console.log('!!! Wrong cmd !!!');
    console.log('get');
    console.log('or');
    console.log('set [regAddr] [value]');
    console.log('ex) get');
    console.log('ex) set 301 0');
    
}

function writeRegister(holding, item, name, reg, val) {
    //console.log(reg + ' : ' + val);
    
    regmap[reg] = {'name':name, 'size':item.size, 'type':item.type, 'value':val};

    if (item.size == 1) {
        if (item.type[0] == 'u') {
            holding.writeUInt16BE(val, reg * 2);
        } else {
            holding.writeInt16BE(val, reg * 2);
        }
        reg += 1;
    } else if (item.size == 2) {
        if (item.type[0] == 'u') {
            let buf = Buffer.alloc(4);
            buf.writeUInt32BE(val);
            holding.writeUInt16BE(buf.readUInt16BE(2), reg*2);
            holding.writeUInt16BE(buf.readUInt16BE(0), (reg+1)*2);
            buf = undefined;
        } else if (item.type[0] == 'f') {
            let buf = Buffer.alloc(4);
            buf.writeFloatBE(val);
            holding.writeUInt16BE(buf.readUInt16BE(2), reg*2);
            holding.writeUInt16BE(buf.readUInt16BE(0), (reg+1)*2);
            buf = undefined;
        } else {
            let buf = Buffer.alloc(4);
            buf.writeInt32BE(val);
            holding.writeUInt16BE(buf.readUInt16BE(2), reg*2);
            holding.writeUInt16BE(buf.readUInt16BE(0), (reg+1)*2);
            buf = undefined;
        }
        reg += 2;
    }

    return reg;
}

function initHoldingRegister(spec, holding) {
    let rslt = {};

    try {
        let readreg = spec.CommSpec[commSpecVer].read['starting-register'];

        spec.CommSpec[commSpecVer].read.items.map((item) => {
            readreg = writeRegister(holding, itemSpec[item], item, readreg, randomVal());
        });

        if (spec.Devices) {
            spec.Devices.map((dvc, idx) => {
                if (dvc.CommSpec[commSpecVer].read['starting-register']) {
                    readreg = dvc.CommSpec[commSpecVer].read['starting-register'];
                }

                dvc.CommSpec[commSpecVer].read.items.map((item) => {
                    readreg = writeRegister(holding, itemSpec[item], item, readreg, randomVal());
                });
            });
        }
    } catch (e) {
        console.log(e);
    }
}

let args = process.argv.slice(2);

if (!args || args.length == 0) {
    printUsage();
    process.exit();
} else if (args[0] === 'list') {
    printSerialPorts();
} else {

    if (args.length != 2) {
        printUsage();
        return;
    }
    
    const path = args[0];
    const specPath = args[1];

    const fs = require('fs');

    let dvcSpec = null;

    try {
        let rawdata = fs.readFileSync(specPath);
        dvcSpec = JSON.parse(rawdata);
        console.log(dvcSpec);
    } catch(e) {
        console.log(e);
        return;
    }

    const holding = Buffer.alloc(10000);
    const socket = new SerialPort(path, options);
    const server = new modbus.server.RTU(socket, {holding:holding});
    server.on('connection', function (client) {
        console.log('new connection');
    });
    
    //server.holding.writeUInt16BE(1, 16);
    /*
    server.on('preReadHoldingRegisters', function (request, response, send) {
        console.log('preReadHoldingRegisters');
        console.log('req:');
        console.log(request);
        console.log('res:');
        console.log(response);
        console.log('send:');
        console.log(send);
    });
    server.on('readHoldingRegisters', function (request, response, send) {
        console.log('readHoldingRegisters');
        console.log('req:');
        console.log(request);
        console.log('res:');
        console.log(response);
        console.log('send:');
        console.log(send);  
    });
 
    server.on('writeMultipleRegisters', function (request, response, send) {
        console.log('writeMulitpleRegisters');
        console.log('req:');
        console.log(request);
        console.log('res:');
        console.log(response);
        console.log('send:');
        console.log(send);  
    });
    */
    server.on('preWriteMultipleRegisters', function (request, response, send) {
        console.log('preWriteMulitpleRegisters');
        console.log('req:');
        console.log(request);
        console.log('res:');
        console.log(response);
        console.log('send:');
        console.log(send);  
    });
    
    initHoldingRegister(dvcSpec, server.holding);

    console.log(regmap);

    rl.on('line', function (line) {
        if (line === 'get') {
            console.log(regmap);
        } else {
            let sp = line.split(' ');
            
            if (sp[0] !== 'set') {
                printCmdUsage();
                return;
            }

            let reg = parseInt(sp[1]);
            if (!reg) {
                printCmdUsage();
                return;
            }

            let value = parseInt(sp[2]);
            if (isNaN(value)) {
                printCmdUsage();
                return;
            }

            let oldval = regmap[reg];

            if (!oldval) {
                console.log(reg + " not exist.");
                return;
            }
            
            oldval['value'] = value;

            writeRegister(server.holding, oldval, oldval['name'], reg, value);
            console.log('ok!');

        }
    }).on('close', function(){
        process.exit();
    });

    //server.holding.writeUInt16BE(8,201*2);

    /*let buf = Buffer.alloc(4);
    buf.writeFloatBE(28.8);
    console.log(buf.readUInt16BE(2).toString(16));
    console.log(buf.readUInt16BE(0).toString(16));
    console.log(buf.toString('hex'));
    //server.holding.writeUInt16BE(16, 1);
    server.holding.writeUInt16BE(buf.readUInt16BE(2), 1*2);
    server.holding.writeUInt16BE(buf.readUInt16BE(0), 2*2);*/

    
    
}

