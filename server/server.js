//const http = require('http');
//const hostname = '127.0.0.1';
const port = 8000;

const deviceSpecDir = 'DeviceSpec';
const testSpecDir = 'TestSpec';

const fs = require('fs');

const deviceConnect = require('./deviceConnect');
const plantumlEncoder = require('plantuml-encoder');
const testUtil = require('./testUtil');

/*const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});*/
var path = require('path');
var express = require('express');
var url = require('url');
var querystring = require('querystring');
const fileUpload = require('express-fileupload');
var app = express();

const UMLREQ = '시험기->노드:';
const UMLREQERR = '시험기 -x 노드:(전송안함)';
const UMLRES = '시험기<--노드:';
const UMLNOTEREQ = 'rnote right of 시험기 #EEEEEE\n';
const UMLNOTERES = 'rnote left of 노드 #EEEEEE\n';
const UMLNOTEEXPECT = 'rnote left of 시험기 #EEEEEE\n';
const UMLEXPECTPASS = '<back:green><size:20><color #FFFFFF> PASS </color></size></back>\n'
const UMLEXPECTFAIL = '<back:red><size:20><color #FFFFFF> FAIL </color></size></back>\n'
const UMLNOTEEND = 'endrnote\n';
const UMLGETREQTABLE = '| function code | starting address | register number |\n| 1 Byte | 2 Byte | 2 Byte |\n';
const UMLSETREQTABLE = '| function code | starting address | register number | byte number | register value |\n| 1 Byte | 2 Byte | 2 Byte | 1 Byte | ';//2N byte |\n';
const UMLGETRESTABLE = '| function code | byte number | register value |\n| 1 Byte | 1 Byte | ';//2N Byte |\n';
const UMLSETRESTABLE = '| function code | starting address | register number |\n| 1 Byte | 2 Byte | 2 Byte |\n';

let OPID_VALUE = 100;

const SLEEP = (ms) => new Promise(resolve => setTimeout(resolve, ms));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(fileUpload());

app.get('/devicespeclist', (req, res) => {
  try {
    var files = fs.readdirSync(deviceSpecDir);

    var rslts = [];

    files.forEach((file) => {
      if (file.toLowerCase().endsWith('.json')) {
        rslts.push(file);
      }
    });

    res.send(JSON.stringify({
      result:"success",
      files:rslts
    }));
  } catch (error) {
    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }
});

app.get('/devicespec', (req, res) => {

  var parsedUrl = url.parse(req.url);
  var parsedQuery = querystring.parse(parsedUrl.query,'&','=');

  try {
    var fbuf = fs.readFileSync(deviceSpecDir + '/' + parsedQuery.file, 'utf-8');

    res.send(JSON.stringify({
      result:"success",
      json:JSON.parse(fbuf)
    }));
  } catch (error) {
    console.log(error);
    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }
});

app.put('/devicespec', (req, res) => {

  !fs.existsSync(deviceSpecDir) && fs.mkdirSync(deviceSpecDir);

  var filename = req.body.name;

  if (!filename.toLowerCase().endsWith('.json')) {
    filename += '.json';
  }

  if (!req.body.overwrite && fs.existsSync(deviceSpecDir + '/' + filename)) {
    res.send(JSON.stringify({
      result:"duplicate",
      errormsg:""
    }));
    return;
  }

  try {
    fs.writeFileSync(deviceSpecDir + '/' + filename, JSON.stringify(req.body.json, null, 4));

    res.send(JSON.stringify({
      result:"success",
      file:filename
    }));
  } catch (error) {

    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }

});

app.post('/devicespec', (req, res) => {

  !fs.existsSync(deviceSpecDir) && fs.mkdirSync(deviceSpecDir);

  console.log(req.files);

  var filename = req.files.file.name;

  req.files.file.mv(deviceSpecDir + '/' + filename, (err) => {
    if (err) {
      res.send(JSON.stringify({
        result:"error",
        errormsg:err
      }));
    } else {
      res.send(JSON.stringify({
        result:"success",
        file:filename
      }));
    }
  });
});

app.delete('/devicespec', (req, res) => {

  var parsedUrl = url.parse(req.url);
  var parsedQuery = querystring.parse(parsedUrl.query,'&','=');

  try {
    var fbuf = fs.unlinkSync(deviceSpecDir + '/' + parsedQuery.file);

    res.send(JSON.stringify({
      result:"success",
    }));
  } catch (error) {
    res.send(JSON.stringify({
      result:"error",
      errormsg:error
    }));
  }
});

app.put('/testspec', (req, res) => {

  !fs.existsSync(testSpecDir) && fs.mkdirSync(testSpecDir);

  var filename = req.body.name;

  if (!filename.toLowerCase().endsWith('.test')) {
    filename += '.test';
  }

  if (!req.body.overwrite && fs.existsSync(testSpecDir + '/' + filename)) {
    res.send(JSON.stringify({
      result:"duplicate",
      errormsg:""
    }));
    return;
  }

  try {

    let data = "";

    req.body.data.map((test) => {
      console.log(test.test);
      if (data.length > 0) data += "\n";
      data += test.test;
    });

    fs.writeFileSync(testSpecDir + '/' + filename, data);

    res.send(JSON.stringify({
      result:"success",
      file:filename
    }));
  } catch (error) {

    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }

});

app.get('/testspeclist', (req, res) => {
  try {
    var files = fs.readdirSync(testSpecDir);

    var rslts = [];

    files.forEach((file) => {
      if (file.toLowerCase().endsWith('.test')) {
        rslts.push(file);
      }
    });

    res.send(JSON.stringify({
      result:"success",
      files:rslts
    }));
  } catch (error) {
    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }
});

app.get('/testspec', (req, res) => {

  var parsedUrl = url.parse(req.url);
  var parsedQuery = querystring.parse(parsedUrl.query,'&','=');

  try {
    var fbuf = fs.readFileSync(testSpecDir + '/' + parsedQuery.file, 'ascii');

    res.send(JSON.stringify({
      result:"success",
      data:fbuf
    }));
  } catch (error) {
    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }
});

app.delete('/testspec', (req, res) => {

  var parsedUrl = url.parse(req.url);
  var parsedQuery = querystring.parse(parsedUrl.query,'&','=');

  try {
    var fbuf = fs.unlinkSync(testSpecDir + '/' + parsedQuery.file);

    res.send(JSON.stringify({
      result:"success",
    }));
  } catch (error) {
    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }
});

app.get('/serialport', (req, res) => {
  try {
    deviceConnect.getSerialPorts((ports) => {
      console.log(ports);

      res.send(JSON.stringify({
        result:"success",
        ports:ports
      }));
    });
  } catch (error) {
    res.send(JSON.stringify({
      result:"error",
      errormsg:error.message
    }));
  }
});

app.post('/serialport', (req, res) => {


  let path = req.body.path;
  let slave = req.body.slave;
  let device = req.body.device;
  let test = req.body.test;

  console.log(path);
  console.log(device);
  console.log(test);
  console.log(slave);

  deviceConnect.connect(path, slave, (rslt, e, client) => {
    if (!rslt) {
      console.log(e);
      res.send(JSON.stringify({
        result:"error",
        errormsg:String(e)
      }));
    } else {

      let testArr = testUtil.getTests(device, test);

      if (typeof testArr == 'string') {
        deviceConnect.disconnect(e);

        res.send(JSON.stringify({
          result:"error",
          errormsg:String(testArr)
        }));

        return;
      }

      let umlstr = "skinparam ParticipantPadding 100\n";
      let umlstrsimple = "";

      (async () => {
        let lastGet = [];

        for(let i=0; i<testArr.length; i++) {
          let ts = testArr[i];

          if (ts.error) {
            umlstr += UMLREQERR + ts.error + ts.command + '\n';
            umlstrsimple += UMLREQERR + ts.error + ts.command + '\n';
          } else if (ts.set) {
            console.log('ts.set');
            console.log(ts.set);

            umlstr += 'group ' + ts.command + '\n';

            umlstr += UMLREQ + ts.set.operation + '\n';
            umlstr += UMLNOTEREQ;
            umlstr += UMLSETREQTABLE + (ts.set.size * 2) + ' Byte |\n';
            umlstr += '| 0x10 | ' + ts.set.reg + ' | ' + ts.set.size + ' | ' + (ts.set.size * 2) + ' | ' + ts.set.value + ' |\n';
            umlstr += UMLNOTEEND;

            umlstrsimple += UMLREQ + ts.command + '\n';

            let valueBufs = [];
            valueBufs.push(deviceConnect.writeValue(ts.set));

            let rsltErr = null;
            let startReg = ts.set.reg;
            let rsltSize = 0;
            let rsltFc = "";

            let rslt = await deviceConnect.write(client, ts.set);

            if (typeof rslt == 'string') {
              umlstr += UMLRES + rslt + '\n';
              rsltErr = rslt;
            } else {
              umlstr += UMLRES + ' \n';
              umlstr += UMLNOTERES;
              umlstr += UMLSETRESTABLE;
              umlstr += '| 0x' + rslt.fc.toString(16) + ' | ' + rslt.start + ' | ' + rslt.quantity + ' |\n';
              umlstr += UMLNOTEEND;

              rsltFc = '0x' + rslt.fc.toString(16);
              rsltSize += rslt.quantity;
            }

            if (ts.set.param && ts.set.param.length > 0) {
              for(let j=0; j<ts.set.param.length; j++) {
                let paitem = ts.set.param[j];

                umlstr += UMLREQ + paitem.name + '\n';
                umlstr += UMLNOTEREQ;
                umlstr += UMLSETREQTABLE + (paitem.size * 2) + ' Byte |\n';
                umlstr += '| 0x10 | ' + paitem.reg + ' | ' + paitem.size + ' | ' + (paitem.size * 2) + ' | ' + paitem.value + ' |\n';
                umlstr += UMLNOTEEND;

                valueBufs.push(deviceConnect.writeValue(paitem));

                rslt = await deviceConnect.write(client, paitem);

                if (typeof rslt == 'string') {
                  umlstr += UMLRES + rslt + '\n';
                  rsltErr = rslt;
                } else {
                  umlstr += UMLRES + ' \n';
                  umlstr += UMLNOTERES;
                  umlstr += UMLSETRESTABLE;
                  umlstr += '| 0x' + rslt.fc.toString(16) + ' | ' + rslt.start + ' | ' + rslt.quantity + ' |\n';
                  umlstr += UMLNOTEEND;

                  rsltSize += rslt.quantity;
                }
              }
            }

            ts.set.opid.value = OPID_VALUE;
            OPID_VALUE++;
            umlstr += UMLREQ + 'opid\n';
            umlstr += UMLNOTEREQ;
            umlstr += UMLSETREQTABLE + (ts.set.opid.size * 2) + ' Byte |\n';
            umlstr += '| 0x10 | ' + ts.set.opid.reg + ' | ' + ts.set.opid.size + ' | ' + (ts.set.opid.size * 2) + ' | ' + ts.set.opid.value + ' |\n';
            umlstr += UMLNOTEEND;

            valueBufs.push(deviceConnect.writeValue(ts.set.opid));
            rslt = await deviceConnect.write(client, ts.set.opid);

            if (typeof rslt == 'string') {
              umlstr += UMLRES + rslt + '\n';
              rsltErr = rslt;
            } else {
              umlstr += UMLRES + ' \n';
              umlstr += UMLNOTERES;
              umlstr += UMLSETRESTABLE;
              umlstr += '| 0x' + rslt.fc.toString(16) + ' | ' + rslt.start + ' | ' + rslt.quantity + ' |\n';
              umlstr += UMLNOTEEND;

              rsltSize += rslt.quantity;
            }

            umlstr += 'end\n';

            let sndbuf = Buffer.concat(valueBufs);

            umlstrsimple += UMLNOTEREQ;
            umlstrsimple += UMLSETREQTABLE + sndbuf.length + ' Byte |\n';
            umlstrsimple += '| 0x10 | ' + startReg + ' | ' + (sndbuf.length / 2) + ' | ' + sndbuf.length + ' | ';

            for(let j=0; j<sndbuf.length; j++) {

              if (j > 0 && j % 4 == 0) {
                umlstrsimple += '| | | | | ';
              }

              let hex = sndbuf[j].toString(16);

              if (hex.length < 2)
                hex = '0' + hex;

              umlstrsimple += hex + ' ';

              if ((j + 1) % 4 == 0) {
                umlstrsimple += '|\n';
              }
            }

            if (umlstrsimple[umlstrsimple.length - 1] != '\n') {
              umlstrsimple += '\n';
            }

            umlstrsimple += UMLNOTEEND;

            if (rsltErr && rsltErr.length > 0) {
              umlstrsimple += UMLRES + rsltErr + '\n';
            } else {
              umlstrsimple += UMLRES + ' \n';
              umlstrsimple += UMLNOTERES;
              umlstrsimple += UMLSETRESTABLE;
              umlstrsimple += '| ' + rsltFc + ' | ' + startReg + ' | ' + rsltSize + ' |\n';
              umlstrsimple += UMLNOTEEND;
            }

          } else if (ts.get) {
            //umlstr += UMLREQ + ts.command + '\n';

            console.log('ts.get');
            console.log(ts.get);

            lastGet = [];

            umlstrsimple += UMLREQ + ts.command + '\n';

            if (ts.get.length <= 0) {
              umlstr += UMLREQ + ts.command + '\n';
              umlstr += UMLRES + 'error' + '\n';
              umlstrsimple += UMLRES + 'error' + '\n';
            } else {
              umlstr += 'group ' + ts.command + '\n';

              let startReg = ts.get[0].reg;
              let reqSize = 0;
              let rsltBufs = [];
              let rsltErr = null;

              for(let j=0; j<ts.get.length; j++) {

                let getitem = ts.get[j];

                let last = {};
                last.target = getitem.target;

                umlstr += UMLREQ + getitem.target + '\n';

                umlstr += UMLNOTEREQ;
                umlstr += UMLGETREQTABLE;
                umlstr += '| 0x03 | ' + getitem.reg + ' | ' + getitem.size + ' |\n';
                umlstr += UMLNOTEEND;

                let rsltbuf = await deviceConnect.read(client, getitem);
                rsltBufs.push(rsltbuf);
                reqSize += getitem.size;
                let rslt = deviceConnect.readValue(rsltbuf, getitem);

                if (typeof rslt == 'string') {
                  umlstr += UMLRES + rslt + '\n';
                  last.error = rslt;
                  rsltErr = rslt;
                } else {
                  umlstr += UMLRES + rslt + '\n';
                  umlstr += UMLNOTERES;
                  umlstr += UMLGETRESTABLE + (getitem.size * 2) + ' Byte |\n';
                  umlstr += '| 0x03 | ' + (getitem.size * 2) + ' | ' + rslt + ' |\n';
                  umlstr += UMLNOTEEND;
                  last.value = rslt;
                }
                lastGet.push(last);
              }

              umlstr += 'end\n';

              umlstrsimple += UMLNOTEREQ;
              umlstrsimple += UMLGETREQTABLE;
              umlstrsimple += '| 0x03 | ' + startReg + ' | ' + reqSize + ' |\n';
              umlstrsimple += UMLNOTEEND;

              let rcvbuf = Buffer.concat(rsltBufs);

              umlstrsimple += UMLRES + ' \n';
              umlstrsimple += UMLNOTERES;
              umlstrsimple += UMLGETRESTABLE + rcvbuf.length + ' Byte |\n';
              umlstrsimple += '| 0x03 | ' + rcvbuf.length + ' | ';

              for(let j=0; j<rcvbuf.length; j++) {

                if (j > 0 && j % 4 == 0) {
                  umlstrsimple += '| | | ';
                }

                let hex = rcvbuf[j].toString(16);

                if (hex.length < 2)
                  hex = '0' + hex;

                umlstrsimple += hex + ' ';

                if ((j + 1) % 4 == 0) {
                  umlstrsimple += '|\n';
                }
              }

              if (umlstrsimple[umlstrsimple.length - 1] != '\n') {
                umlstrsimple += '\n';
              }

              umlstrsimple += UMLNOTEEND;
            }

          } else if (ts.sleep) {
            console.log('ts.sleep');
            console.log(ts.sleep);

            umlstr += '...sleep ' + ts.sleep + ' ms...\n';
            umlstrsimple += '...sleep ' + ts.sleep + ' ms...\n';

            await SLEEP(ts.sleep);
          } else if (ts.expect) {
            console.log('ts.expect');
            console.log(ts.expect);

            if (lastGet.length <= 0) {
              umlstr += UMLNOTEEXPECT;
              umlstrsimple += UMLNOTEEXPECT;
              umlstr += '(비교 대상 없음)' + ts.command + '\n';
              umlstrsimple += '(비교 대상 없음)' + ts.command + '\n';
              umlstr += UMLEXPECTFAIL;
              umlstrsimple += UMLEXPECTFAIL;
              umlstr += UMLNOTEEND;
              umlstrsimple += UMLNOTEEND;
            } else {
              umlstr += UMLNOTEEXPECT;
              umlstrsimple += UMLNOTEEXPECT;
              umlstr += ts.command + '\n';
              umlstrsimple += ts.command + '\n';

              let rsltstr = "";
              let success = true;

              for(let k=0; k<lastGet.length; k++) {
                let last = lastGet[k];
                let find = false;
                for(let l=0; l<ts.expect.length; l++) {
                  let exp = ts.expect[l];
                  if (last.target === exp.target) {
                    if (last.value === exp.value) {
                      rsltstr += last.target + ' : ' + last.value + '\n';
                    } else {
                      rsltstr += last.target + ' : <color #FF0000>' + last.value + '</color>\n';
                      success = false;
                    }
                    find = true;
                    break;
                  }
                }

                if (!find) {
                  rsltstr += ts.expect.target + ' : <color #FF0000>(대상없음)</color>\n';
                  success = false;
                }
              }

              if (success) {
                umlstr += UMLEXPECTPASS;
                umlstrsimple += UMLEXPECTPASS;
              } else {
                umlstr += UMLEXPECTFAIL;
                umlstrsimple += UMLEXPECTFAIL;
              }

              umlstr += rsltstr;
              umlstr += UMLNOTEEND;
              umlstrsimple += rsltstr;
              umlstrsimple += UMLNOTEEND;
            }
          }
        }
      })().then(() => {
        deviceConnect.disconnect(e);

        console.log(umlstr);
        let enc = plantumlEncoder.encode(umlstr);
        let encsimple = plantumlEncoder.encode(umlstrsimple);

        res.send(JSON.stringify({
          result:"success",
          urldetail:"http://www.plantuml.com/plantuml/svg/" + enc,
          url:"http://www.plantuml.com/plantuml/svg/" + encsimple
        }));
      });
    }
  });
});

app.use(express.static(path.join(__dirname, '/../smartfarm/build')));
app.set('/', path.join(__dirname, '/../smartfarm/build'));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/../smartfarm/build/index.html'));
});



app.listen(port, () => {
  console.log(`Server running at ${port}/`);
});
