const SerialPort = require('serialport');
const ModbusRTU = require('jsmodbus');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getSerialPorts(callback) {
    let ports = [];

    SerialPort.list().then((value) => {
        for(let i=0; i<value.length; i++) {
            let port = value[i];
            if (port.path.toLowerCase().indexOf('usb') > 0) {
                console.log(port);
                ports.push(port.path);
            }
        }
    }).then(() => {
        callback(ports);
    });
}
/*
var path = null;

SerialPort.list().then((value) => {
    for(var i=0; i<value.length; i++) {
        var port = value[i];

        console.log(port.path);

        if (port.path.indexOf('usb') > 0) {
            path = port.path;
            break;
        }
    }
}).then(() => {
    if (path == null)
        console.log('serialport not found.');
    else
        connect(path);
});
*/

function readValue(buf, item) {
    if (item.size == 1) {
        if (item.type[0] == 'u') {
            return buf.readUInt16BE(0);
        } else {
            return buf.readInt16BE(0);
        }
    } else if (item.size == 2) {
        let tmpbuf = Buffer.alloc(4);
        tmpbuf.writeUInt16BE(buf.readUInt16BE(2), 0);
        tmpbuf.writeUInt16BE(buf.readUInt16BE(0), 2);
        if (item.type[0] == 'f') {
            return tmpbuf.readFloatBE();
        } else if (item.type[0] == 'u') {
            return tmpbuf.readUInt32BE();
        } else {
            return tmpbuf.readInt32BE();
        }
    }

    return 0;
}

function writeValue(item) {
    let buf = Buffer.alloc(item.size * 2);

    if (item.size == 1) {
        if (item.type[0] == 'u') {
            buf.writeUInt16BE(item.value);
        } else {
            buf.writeInt16BE(item.value);
        }
    } else if (item.size == 2) {
        let tmpbuf = Buffer.alloc(item.size * 2);

        if (item.type[0] == 'f') {
            tmpbuf.writeFloatBE(item.value);
        } else if (item.type[0] == 'u') {
            tmpbuf.writeUInt32BE(item.value);
        } else {
            tmpbuf.writeInt32BE(item.value);
        }

        buf.writeUInt16BE(tmpbuf.readUInt16BE(2), 0);
        buf.writeUInt16BE(tmpbuf.readUInt16BE(0), 2);
    }

    return buf;
}

async function read(client, item) {
    try {
        let resp = await client.readHoldingRegisters(item.reg, item.size);
        console.log(resp.response);
        let val = resp.response.body.valuesAsBuffer;

        return val;
    } catch (err) {
        console.log(err.message);
        return err.message;
    }
}

async function write(client, item) {
    try {
        let buf = writeValue(item);

        let resp = await client.writeMultipleRegisters(item.reg, buf);

        return resp.response.body;
    } catch (err) {

        return err.message;
    }
}

function disconnect(sp) {
    sp.close();
}

function connect(path, slave, callback) {
    if (!path) return;

    console.log('connect to ' + path);
    const SP = new SerialPort(path, { baudRate:9600 });
    const client = new ModbusRTU.client.RTU(SP, slave);

    SP.on('open', () => {
       /*client.readHoldingRegisters(1, 1).then((resp) => {
           console.log('!!!@@@@');
           console.log(resp.response);
       }).catch(() => {
           console.log('err');
       })*/
        callback(true, SP, client);
    });

    SP.on('error', (e) => {
        callback(false, e);
    })
/*
    let client = new ModbusRTU();
    client.connectRTU(path, { baudRate:9600 }, () => {
        client.setID(1);
        console.log('start!');


        client.readHoldingRegisters(1, 1).then((a,b) => {
            console.log('rere');
            console.log(a);
            console.log(b);
        });
    });
*/



/*
    const getMetersValue = async (meters) => {
        try{
            await sleep(1000);
            console.log('start!');

            client.readHoldingRegisters(1, 6, function (err, data) {
                console.log(data);
                console.log(err);
                console.log(data.data);
            });

        } catch(e){
            // if error, handle them here (it should not)
            console.log(e)
        }
    }
*/



    //getMetersValue([1,2,3,4]);

    /*
    SP.on('open', function() {
        console.log('open! rate:' + SP.baudRate);

        const master = new ModbusMaster(SP);
        master.readHoldingRegisters(1, 2, 6).then((data) => {
           console.log(data);
        });
    });
    SP.on('close', function() {
        console.log('close!');
    });
    SP.on('data', function(data) {
        console.log(data);
    });
    SP.on('readable', function() {
        console.log('read:' + SP.read());
    });
    SP.on('error', function(data) {
        console.log(data);
    });*/
}

exports.getSerialPorts = getSerialPorts;
exports.connect = connect;
exports.disconnect = disconnect;
exports.read = read;
exports.write = write;
exports.writeValue = writeValue;
exports.readValue = readValue;
