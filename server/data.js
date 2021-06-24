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

const operationSpec = {
    reset : {
        value : 1,
        size : 1,
        type : 'uint16'
    },
    control : {
        value : 2,
        size : 1,
        type : 'uint16',
        parameter : {
            control : {
                size : 1,
                type : 'uint16',
            }
        }
    },
    open : {
        value : 301,
        size : 1,
        type : 'uint16'
    },
    close : {
        value : 302,
        size : 1,
        type : 'uint16'
    },
    stop : {
        value : 0,
        size : 1,
        type : 'uint16'
    },
    'timed-open' : {
        value : 303,
        size : 1,
        type : 'uint16',
        parameter : {
            time : {
                size : 2,
                type : 'uint32',
            }
        }
    },
    'timed-close' : {
        value : 304,
        size : 1,
        type : 'uint16',
        parameter : {
            time : {
                size : 2,
                type : 'uint32',
            }
        }
    },
    'set-position' : {
        value : 305,
        size : 1,
        type : 'uint16',
        parameter : {
            position : {
                size : 1,
                type : 'uint16',
            }
        }
    },
    'set-config' : {
        value : 306,
        size : 1,
        type : 'uint16',
        parameter : {
            opentime : {
                size : 1,
                type : 'uint16',
            },
            closetime : {
                size : 1,
                type : 'uint16',
            }
        }
    },
    on : {
        value : 201,
        size : 1,
        type : 'uint16'
    },
    off : {
        value : 0,
        size : 1,
        type : 'uint16'
    },
    'timed-on' : {
        value : 202,
        size : 1,
        type : 'uint16',
        parameter : {
            'hold-time': {
                size: 1,
                type: 'uint16',
            }
        }
    },
    'directional-on' : {
        value : 306,
        size : 1,
        type : 'uint16',
        parameter : {
            'hold-time' : {
                size : 1,
                type : 'uint16',
            },
            ratio : {
                size : 1,
                type : 'int16',
            }
        }
    },
    'nutrient-supply-on' : {
        value : 401,
        size : 1,
        type : 'uint16'
    },
    'area-on' : {
        value : 402,
        size : 1,
        type : 'uint16',
        parameter : {
            'start-area': {
                size: 1,
                type: 'uint16',
            },
            'stop-area': {
                size: 1,
                type: 'uint16',
            },
            'on-sec': {
                size: 2,
                type: 'uint32',
            },
        }
    },
    'param-on' : {
        value : 403,
        size : 1,
        type : 'uint16',
        parameter : {
            'start-area': {
                size: 1,
                type: 'uint16',
            },
            'stop-area': {
                size: 1,
                type: 'uint16',
            },
            'on-sec': {
                size: 2,
                type: 'uint32',
            },
            'EC': {
                size: 2,
                type: 'float',
            },
            'pH': {
                size: 2,
                type: 'float',
            },
        }
    },
}

exports.commSpecVer = commSpecVer;
exports.itemSpec = itemSpec;
exports.operationSpec = operationSpec;

