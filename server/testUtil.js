const Data = require('./data');

function wrongCommand(item) {
    console.trace();
    item.error = '(잘못된 명령어)';
}

function wrongDevice(item) {
    item.error = '(잘못된 장비)';
}

function wrongRegister(item) {
    item.error = '(잘못된 Register)';
}

function parseDeviceSpec(spec) {
    let rslt = {};

    try {
        let node = {};

        node.type = spec.Type;

        node.read = {};
        node.read.start = spec.CommSpec[Data.commSpecVer].read['starting-register'];

        let readreg = node.read.start;
        let writereg = -1;

        spec.CommSpec[Data.commSpecVer].read.items.map((item) => {
            node.read[item] = {};
            node.read[item].reg = readreg;
            node.read[item].size = Data.itemSpec[item].size;
            node.read[item].type = Data.itemSpec[item].type;

            readreg += node.read[item].size;
        });

        if (spec.CommSpec[Data.commSpecVer].write) {
            writereg = spec.CommSpec[Data.commSpecVer].write['starting-register'];
            node.write = {};
            spec.CommSpec[Data.commSpecVer].write.items.map((item) => {
                node.write[item] = {};
                node.write[item].reg = writereg;
                node.write[item].size = Data.itemSpec[item].size;
                node.write[item].type = Data.itemSpec[item].type;

                writereg += node.write[item].size;
            });
        }

        rslt[spec.Class] = node;

        if (spec.Devices) {
            spec.Devices.map((dvc, idx) => {
                let sub = {};

                sub.type = dvc.Type;

                sub.read = {};

                if (dvc.CommSpec[Data.commSpecVer].read['starting-register']) {
                    readreg = dvc.CommSpec[Data.commSpecVer].read['starting-register'];
                }

                dvc.CommSpec[Data.commSpecVer].read.items.map((item) => {
                    sub.read[item] = {};
                    sub.read[item].reg = readreg;
                    sub.read[item].size = Data.itemSpec[item].size;
                    sub.read[item].type = Data.itemSpec[item].type;

                    readreg += sub.read[item].size;
                });

                if (dvc.CommSpec[Data.commSpecVer].write) {
                    if (dvc.CommSpec[Data.commSpecVer].write['starting-register']) {
                        writereg = dvc.CommSpec[Data.commSpecVer].write['starting-register'];
                    } else {
                        if (writereg < 0) return {error:'(잘못된 register)'};
                    }

                    sub.write = {};

                    dvc.CommSpec[Data.commSpecVer].write.items.map((item) => {
                        sub.write[item] = {};
                        sub.write[item].reg = writereg;
                        sub.write[item].size = Data.itemSpec[item].size;
                        sub.write[item].type = Data.itemSpec[item].type;

                        writereg += sub.write[item].size;
                    });
                }

                rslt[String(idx)] = sub;
            });
        }

        return rslt;
    } catch (e) {
        console.log(e);
        return null;
    }
}

function parseSet(device, testItem) {
    let sp = testItem.command.split(' ');

    if (sp.length != 3 && sp.length != 4) {
        wrongCommand(testItem);
        
        return;
    }

    console.log('parseSet');
    console.log(testItem.command);

    if (!sp[1].startsWith('DEVICE')) {
        wrongCommand(testItem);
        return;
    }

    let dvc = sp[1].split('=');
    if (dvc.length != 2) {
        wrongDevice(testItem);
        return;
    }

    let dspec = null;

    if (dvc[1].indexOf(':') > 0) {
        let subdvc = dvc[1].split(':');
        dspec = device[subdvc[0]];
    } else {
        dspec = device.node;
    }

    console.log('dspec');
    console.log(dspec);

    if (!sp[2].startsWith('OPERATION')) {
        wrongCommand(testItem);
        return;
    }

    let oper = sp[2].split('=');
    if (!oper || oper.length != 2) {
        wrongCommand(testItem);
        return;
    }

    if (!dspec.write['operation']) {
        wrongCommand(testItem);
        return;
    }

    let operation = oper[1];

    let opSpec = Data.operationSpec[operation];

    if (dspec.type.indexOf('nutrient-supply') >= 0) {
        if (operation === 'on') {
            opSpec = Data.operationSpec['nutrient-supply-on'];
        }
    }

    testItem.set = {};
    testItem.set.operation = operation;
    testItem.set.reg = dspec.write['operation'].reg;
    testItem.set.size = opSpec.size;
    testItem.set.type = opSpec.type;
    testItem.set.value = opSpec.value;

    if (sp.length == 4 && sp[3]) {

        if (!sp[3].startsWith('PARAMETER')) {
            wrongCommand(testItem);
            return;
        }

        if (!opSpec.parameter) {
            wrongCommand(testItem);
            return;
        }

        let param = sp[3].split('=');
        if (!param || param.length != 2) {
            wrongCommand(testItem);
            return;
        }

        testItem.set.param = [];

        params = param[1].split(',');

        params.map((pa) => {

            let paval = pa.split(':');
            if (paval.length != 2) {
                wrongCommand(testItem);
                return;
            }

            let pasp = opSpec.parameter[paval[0]];
            if (!pasp) {
                wrongCommand(testItem);
                return;
            }

            if (!dspec.write[paval[0]]) {
                console.log(paval[0]);
                wrongCommand(testItem);
                return;
            }

            let newpa = {}
            newpa.name = paval[0];
            newpa.reg = dspec.write[paval[0]].reg;
            newpa.size = pasp.size;
            newpa.type = pasp.type;
            newpa.value = parseInt(paval[1]);

            testItem.set.param.push(newpa);
        });
    }
    testItem.set.opid = {};
    testItem.set.opid.reg = dspec.write['opid'].reg;
    testItem.set.opid.size = dspec.write['opid'].size;
    testItem.set.opid.type = dspec.write['opid'].type;
    testItem.set.opid.value = 0;
}

function parseGet(device, testItem) {
    let sp = testItem.command.split(' ');

    console.log('parseGet');
    console.log(testItem.command);

    if (!sp[1].startsWith('DEVICE')) {
        wrongCommand(testItem);
        return;
    }

    let dvc = sp[1].split('=');
    if (dvc.length != 2) {
        wrongDevice(testItem);
        return;
    }

    let dspec = null;

    if (dvc[1].indexOf(':') > 0) {
        let subdvc = dvc[1].split(':');
        dspec = device[subdvc[0]];
    } else {
        dspec = device.node;
    }

    console.log('dspec');
    console.log(dspec);

    if (!sp[2].startsWith('TARGET')) {
        wrongCommand(testItem);
        return;
    }

    let target = sp[2].split('=');

    if (!target || target.length != 2) {
        wrongCommand(testItem);
        return;
    }

    let targets = target[1];

    let targetList = [];
    if (targets.indexOf(',') > 0) {
        targetList = targets.split(',');
    } else {
        targetList.push(targets);
    }

    console.log('target');
    console.log(targetList);

    testItem.get = [];
    try {
        targetList.map((tg) => {
            console.log('target');
            console.log(dspec.read[tg]);
            testItem.get.push({
                target:tg,
                reg: dspec.read[tg].reg,
                size: dspec.read[tg].size,
                type: dspec.read[tg].type,
            });
        });
    } catch (e) {
        wrongCommand(testItem);
        return;
    }
}

function parseSleep(device, testItem) {
    let sp = testItem.command.split(' ');

    if (!sp[1].startsWith('TIME')) {
        wrongCommand(testItem);
        return;
    }

    let time = sp[1].split('=');

    if (!time || time.length != 2) {
        wrongCommand(testItem);
        return;
    }

    testItem.sleep = parseInt(time[1]);

    if (!testItem.sleep || testItem.sleep < 0) {
        wrongCommand(testItem);
        return;
    }
}

function parseExpect(testItem) {
    let sp = testItem.command.split(' ');

    console.log('parseExpect');
    console.log(testItem.command);

    if (!sp[1].startsWith('DEVICE')) {
        wrongCommand(testItem);
        return;
    }

    /*
    let dvc = sp[1].split('=');
    if (dvc.length != 2) {
        wrongDevice(testItem);
        return;
    }

    let dspec = null;

    if (dvc[1].indexOf(':') > 0) {
        let subdvc = dvc[1].split(':');
        dspec = device[subdvc[0]];
    } else {
        dspec = device.node;
    }

    console.log('dspec');
    console.log(dspec);
    */
    if (!sp[2].startsWith('TARGET')) {
        wrongCommand(testItem);
        return;
    }

    let target = sp[2].split('=');

    if (!target || target.length != 2) {
        wrongCommand(testItem);
        return;
    }

    let targets = target[1];

    let targetList = [];
    if (targets.indexOf(',') > 0) {
        targetList = targets.split(',');
    } else {
        targetList.push(targets);
    }

    console.log('target');
    console.log(targetList);

    testItem.expect = [];
    try {
        targetList.map((tg) => {
            if (tg.indexOf(':') > 0) {
                let exp = tg.split(':');
                testItem.expect.push({target:exp[0],value:Number(exp[1])});
            } else {
                wrongCommand(testItem);
                return;
            }
        });
    } catch (e) {
        wrongCommand(testItem);
        return;
    }
}

function getTests(device, tests) {
    let dvcSp = parseDeviceSpec(device);

    console.log(dvcSp);

    if (dvcSp.error) {
        return dvcSp.error;
    }

    let rslt = [];

    tests.map((test) => {
        let item = {};
        item.command = String(test.test);

        let sp = test.test.split(' ');

        if (sp[0] == 'SET') {
            parseSet(dvcSp, item);
        } else if (sp[0] == 'GET') {
            parseGet(dvcSp, item);
        } else if (sp[0] == 'EXPECT') {
            parseExpect(item);
        } else if (sp[0] == 'SLEEP') {
            parseSleep(dvcSp, item);
        } else {
            wrongCommand(item);
        }

        rslt.push(item);
    });

    return rslt;
}

exports.getTests = getTests;
