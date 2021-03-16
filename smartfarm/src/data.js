import CommSpec from './CommSpec';

export const commSpecVer = "KS-X-3267:2021";

export const operationSpec = [
    {
        Class:"node",
        Type:"sensor-node/level1",
        Operations:[{Operation:"reset", Value:1}]
    },
    {
        Class:"node",
        Type:"actuator-node/level1",
        Operations:[{Operation:"reset", Value:1}]
    },
    {
        Class:"node",
        Type:"actuator-node/level2",
        Operations:[
            {Operation:"reset", Value:1},
            {Operation:"control", Value:2, Parameters:[{Parameter:"control", MO:"m", type:"uint16"}]},
        ]
    },
    {
        Class:"node",
        Type:"integrated-node/level1",
        Operations:[{Operation:"reset", Value:1}]
    },
    {
        Class:"node",
        Type:"integrated-node/level2",
        Operations:[
            {Operation:"reset", Value:1},
            {Operation:"control", Value:2, Parameters:[{Parameter:"control", MO:"m", type:"uint16"}]},
        ]
    },
    {
        Class:"actuator",
        Type:"retractable/level0",
        Operations:[
            {Operation:"open", Value:301},
            {Operation:"close", Value:302},
            {Operation:"stop", Value:0},
        ]
    },
    {
        Class:"actuator",
        Type:"retractable/level1",
        Operations:[
            {Operation:"open", Value:301},
            {Operation:"close", Value:302},
            {Operation:"stop", Value:0},
            {Operation:"timed-open", Value:303, Parameters:[{Parameter:"time", MO:"m", type:"uint32"}]},
            {Operation:"timed-close", Value:304, Parameters:[{Parameter:"time", MO:"m", type:"uint32"}]},
        ]
    },
    {
        Class:"actuator",
        Type:"retractable/level2",
        Operations:[
            {Operation:"open", Value:301},
            {Operation:"close", Value:302},
            {Operation:"stop", Value:0},
            {Operation:"timed-open", Value:303, Parameters:[{Parameter:"time", MO:"m", type:"uint32"}]},
            {Operation:"timed-close", Value:304, Parameters:[{Parameter:"time", MO:"m", type:"uint32"}]},
            {Operation:"set-position", Value:305, Parameters:[{Parameter:"position", MO:"m", type:"uint16"}]},
            {Operation:"set-config", Value:306, Parameters:[
                {Parameter:"opentime", MO:"m", type:"uint16"},
                {Parameter:"closetime", MO:"m", type:"uint16"},
            ]},
        ]
    },
    {
        Class:"actuator",
        Type:"switch/level0",
        Operations:[
            {Operation:"on", Value:201},
            {Operation:"off", Value:0},
        ]
    },
    {
        Class:"actuator",
        Type:"switch/level1",
        Operations:[
            {Operation:"on", Value:201},
            {Operation:"off", Value:0},
            {Operation:"timed-on", Value:202, Parameters:[{Parameter:"hold-time", MO:"m", type:"uint16"}]},
        ]
    },
    {
        Class:"actuator",
        Type:"switch/level2",
        Operations:[
            {Operation:"on", Value:201},
            {Operation:"off", Value:0},
            {Operation:"timed-on", Value:202, Parameters:[{Parameter:"hold-time", MO:"m", type:"uint16"}]},
            {Operation:"directional-on", Value:203, Parameters:[
                {Parameter:"hold-time", MO:"m", type:"uint16"},
                {Parameter:"ratio", MO:"m", type:"int16"},
            ]},
        ]
    }
];

export const deviceClasses = [
    'node', 
    'sensor',
    'actuator',
    //'nutrient-supply',
    'misc'
];

export const deviceTypes = {
    node:[
        'sensor-node',
        'actuator-node',
        'integrated-node',
        //'nutrient-supply-node'
    ],
    sensor: [
        'temperature-sensor',
        'humidity-sensor',
        'CO2-sensor',
        'pyranometer-sensor',
        'wind-direction-sensor',
        'wind-speed-sensor',
        'rain-detector-sensor',
        'quantum-sensor',
        'soil-moisture-sensor',
        'tensiometer-sensor',
        'EC-sensor',
        'pH-sensor',
        'soil-temperature-sensor',
        'flow-sensor',
        'voltage-sensor',
        'current-sensor',
        'rain-gauge-sensor',
        'weight-sensor'
    ],
    actuator: [
        'retractable',
        'switch',
        'nutrient-supply'
    ],
    /*nutrient_supply: [
        'nutrient-supply'
    ],*/
    misc: [
        'display',
        //'input/trigger'
    ]
};

export function getDeviceTypes(deviceClass) {
    if (deviceClass == null) return [];

    var key = deviceClass.replace('-', '_');

    var rslt = deviceTypes[key];

    if (rslt === undefined) return [];

    return rslt;
}

export const deviceSubTypes = {
    sensor_node: [
        'level0',
        //'level1'
    ],
    actuator_node: [
        'level0',
        'level1',
        //'level2'
    ],
    integrated_node: [
        'level0',
        'level1',
        //'level2'
    ],
    retractable: [
        'level0',
        'level1',
        'level2'
    ],
    switch: [
        'level0',
        'level1',
        'level2'
    ],
    nutrient_supply: [
        'level0',
        'level1',
        'level2',
        'level3'
    ]
}

export function getDeviceSubTypes(deviceType) {
    if (deviceType == null) return [];

    var key = deviceType.replace('-', '_');

    var rslt = deviceSubTypes[key];

    if (rslt === undefined) return [];

    return rslt;
}

export const valueUnit = [
    1,2,3,4,5,6,7,8,9,10,11,14,15,16,17,'etc'
]

export const sd = [
    'None','0',1,2,3,4,5,6,7,8,9,10
]

export function getCommSpecItems(json) {
    var rslt = null;
    if (json) {
        var spec = json[commSpecVer];
        if (spec === undefined && spec === null)
            return null;
        
        rslt = {};

        if (spec.read) {
            rslt.read = spec.read.items;
        }

        if (spec.write) {
            rslt.write = spec.write.items;
        }
    }

    return rslt;
}

export function getLastSubtype(cls, type) {
    var fulltype = new String(type);
    
    if (fulltype.indexOf('/') > 0) {
        fulltype = fulltype.split('/')[0];
        var subs = deviceSubTypes[fulltype.replace('-', '_')];
        if (subs && subs.length > 0) {
            return subs[subs.length - 1];
        }

    } else {
        return "";
    }

    return "";
}

export function getCommSpecItemsFull(json) {
    var rslt = null;
    if (json) {
        var cls = json.Class;
        var type = new String(json.Type);

        var fulltype = getLastSubtype(cls, type);

        if (type.indexOf('/') > 0) {
            type = type.split('/')[0];
        }

        var spec = CommSpec.getCommSpec(cls, type, fulltype);

        if (spec === undefined && spec === null)
            return null;
        
        rslt = {};

        if (spec.read) {
            rslt.read = [];
            spec.read.items.map((item) => {
                rslt.read.push(item.item);
            });
        }

        if (spec.write) {
            rslt.write = [];
            spec.write.items.map((item) => {
                rslt.write.push(item.item);
            });
        }
    }

    return rslt;
}

export function getCommSpecOperation(cls, type) {
    
    for(var i=0; i<operationSpec.length; i++) {
        var op = operationSpec[i];

        if (op.Class === cls && op.Type === type) {
            return op.Operations;
        }
    }

    return null;
}

export function getCommSpecOperationFull(cls, type) {
    var fulltype = new String(type);
    if (fulltype.indexOf('/') > 0) {
        fulltype = fulltype.split('/')[0];
    }

    var sub = getLastSubtype(cls, type);
    fulltype += '/' + sub;

    for(var i=0; i<operationSpec.length; i++) {
        var op = operationSpec[i];

        if (op.Class === cls && op.Type === fulltype) {
            return op.Operations;
        }
    }

    return null;
}

