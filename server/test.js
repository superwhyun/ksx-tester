const deviceConnect = require('./deviceConnect');

function callback(rslt, e, client) {
    if (!rslt) {
        console.log(String(e));
    } else {
        client.readHoldingRegisters(263, 2).then((resp) => {
            console.log('!!!@@@@');
            console.log(resp.response);
            //console.log(resp.response.body.valuesAsBuffer.readUInt16BE(2));

            let buf = Buffer.alloc(4);
            buf.writeUInt16BE(resp.response.body.valuesAsBuffer.readUInt16BE(2), 0);
            buf.writeUInt16BE(resp.response.body.valuesAsBuffer.readUInt16BE(0), 2);
            console.log(buf.readFloatBE());
            console.log(buf.readUInt32BE());
            console.log(buf.readInt32BE());

            /*client.writeMultipleRegisters(5, [1,2,3]).then((resp) => {
                console.log(resp);
            }).catch((e) => {
                console.log(e);
            })*/
        }).catch((e) => {
            console.log(e);
            deviceConnect.disconnect(e);
        })
    }
}

//deviceConnect.connect('/dev/tty.usbserial-AK066P5C', 1, callback);
let pp = 'opentime:789';

let fd = pp.split(',');

console.log(fd);
