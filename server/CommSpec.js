function item(name, mo = "m") {
    return {item:name, mo:mo};
}

const CommSpec = {
    addOuter: function(cmspc) {
        let json = {};
        json["KS-X-3267:2021"] = cmspc;
        return json;
    },
/*
    getCommSpecJson: function(cls, type, subtype) {
        var json = {};
        var read = {};
        var write = null;

        if  (cls === "node") {
            read["starting-register"] = 201;

            read.items = [
                "status"
            ];

            if (subtype === "level0") {
                write = null;
            } else if (subtype !== "level0" && subtype !== null) {
                read.items.push("opid");
                read.items.push("control");
                
                write = {};
                write["starting-register"] = 301;
                write.items = ["operation", "opid"];

                if (subtype === "level2") {
                    
                    write.items.push("control");
                }
            }
        }

        if  (cls === "sensor") {

            if (type === "temperature-sensor")
                read["starting-register"] = 202;
            else if (type === "humidity-sensor")
                read["starting-register"] = 205;
            else if (type === "CO2-sensor")
                read["starting-register"] = 208;
            else if (type === "pyranometer-sensor")
                read["starting-register"] = 211;
            else if (type === "wind-direction-sensor")
                read["starting-register"] = 214;
            else if (type === "wind-speed-sensor")
                read["starting-register"] = 217;
            else if (type === "rain-detector-sensor")
                read["starting-register"] = 220;
            else if (type === "quantum-sensor")
                read["starting-register"] = 223;
            else if (type === "soil-moisture-sensor")
                read["starting-register"] = 226;
            else if (type === "tensiometer-sensor")
                read["starting-register"] = 229;
            else if (type === "EC-sensor")
                read["starting-register"] = 232;
            else if (type === "pH-sensor")
                read["starting-register"] = 235;
            else if (type === "soil-temperature-sensor")
                read["starting-register"] = 238;
            else if (type === "flow-sensor")
                read["starting-register"] = 241;
            else if (type === "voltage-sensor")
                read["starting-register"] = 244;
            else if (type === "current-sensor")
                read["starting-register"] = 247;

            read.items = [
                "value",
                "status",
            ];
        }

        if  (cls === "actuator") {
            read["starting-register"] = 208;

            if (type === "retractable") {
                read.items = [
                    "status"
                ];
    
                if (subtype === "level0") {
                    write = {};
                    write["starting-register"] = 212;
                    write.items = ["operation", "opid"];
                } else if (subtype === "level1") {
                    read.items.push("opid");
                    read.items.push("state-hold-time");
                    read.items.push("position");
                    read.items.push("remain-time");
                    
                    write = {};
                    write["starting-register"] = 212;
                    write.items = ["operation", "opid", "time"];
                } else if (subtype === "level2") {
                    read.items.push("opid");
                    read.items.push("state-hold-time");
                    read.items.push("position");
                    read.items.push("remain-time");
                    read.items.push("opentime");
                    read.items.push("closetime");
                    
                    write = {};
                    write["starting-register"] = 311;
                    write.items = [
                        "operation", 
                        "opid", 
                        "time",
                        "position",
                        "opentime",
                        "closetime"
                    ];
                }
            } else if (type === "switch") {
                read.items = [
                    "status"
                ];
    
                if (subtype === "level0") {
                    write = {};
                    write["starting-register"] = 311;
                    write.items = ["operation", "opid"];
                } else if (subtype === "level1") {
                    read.items.push("opid");
                    read.items.push("state-hold-time");
                    read.items.push("remain-time");
                    
                    write = {};
                    write["starting-register"] = 311;
                    write.items = ["operation", "opid", "hold-time"];
                } else if (subtype === "level2") {
                    read.items.push("opid");
                    read.items.push("state-hold-time");
                    read.items.push("ratio");
                    read.items.push("remain-time");
                    
                    write = {};
                    write["starting-register"] = 311;
                    write.items = [
                        "operation", 
                        "opid", 
                        "hold-time",
                        "ratio"
                    ];
                }
            } else if (type === "nutrient-supply") {
                read.items = [
                    "opid",
                    "status",
                    "area",
                    "alert"
                ];

                write = {};
                write["starting-register"] = 311;
                write.items = [
                    "operation", 
                    "opid", 
                    "control",
                ];

                if (subtype === "level1") {
                    write.items.push("EC");
                    write.items.push("pH");
                    write.items.push("on-sec");
                    write.items.push("start-area");
                    write.items.push("stop-area");
                }
            }
        }

        if (cls === "misc") {
            if (type === "display") {
                read["starting-register"] = 301;
                read.items = [
                    "opid",
                    "status"
                ];
                
                write = {};
                write["starting-register"] = 401;
                write.items = [
                    "operation", 
                    "opid",
                    "epoch",
                    "vfloat",
                    "vfloat",
                    "vint",
                    "vint"
                ];
            } else {
                read = null;
            }
            
        }

        if (read !== null)
            json.read = read;
        if (write !== null)
            json.write = write;

        return this.addOuter(json);
    },
*/
    getCommSpec: function(cls, type, subtype) {
        let json = {};
        let read = {};
        let write = null;

        if (cls === null || type === null) return null;

        if  (cls === "node") {
            read["starting-register"] = 201;

            read.items = [
                item("status")
            ];

            if (subtype === "level0") {
                write = null;
            } else if (subtype == "level1") {
                read.items.push(item("opid"));
                read.items.push(item("control"));
                
                write = {};
                write["starting-register"] = 301;
                write.items = [item("operation"), item("opid"), item("control")];
            }
        }

        if  (cls === "sensor") {
            if (type === "temperature-sensor")
                read["starting-register"] = 202;
            else if (type === "dewpoint-sensor")
                read["starting-register"] = 202;
            else if (type === "humidity-sensor")
                read["starting-register"] = 205;
            else if (type === "CO2-sensor")
                read["starting-register"] = 208;
            else if (type === "pyranometer")
                read["starting-register"] = 211;
            else if (type === "wind-direction-sensor")
                read["starting-register"] = 214;
            else if (type === "wind-speed-sensor")
                read["starting-register"] = 217;
            else if (type === "rain-detector")
                read["starting-register"] = 220;
            else if (type === "quantum-sensor")
                read["starting-register"] = 223;
            else if (type === "soil-moisture-sensor")
                read["starting-register"] = 226;
            else if (type === "tensiometer")
                read["starting-register"] = 229;
            else if (type === "EC-sensor")
                read["starting-register"] = 232;
            else if (type === "pH-sensor")
                read["starting-register"] = 235;
            else if (type === "soil-temperature-sensor")
                read["starting-register"] = 238;
            else if (type === "flow-sensor")
                read["starting-register"] = 241;
            else if (type === "voltage-sensor")
                read["starting-register"] = 244;
            else if (type === "current-sensor")
                read["starting-register"] = 247;

            read.items = [
                item("value"),
                item("status"),
            ];
        }

        if  (cls === "actuator") {
            read["starting-register"] = 208;

            if (type === "retractable") {
                read.items = [
                    item("status"),
                ];

                if (subtype === "level0") {
                    write = {};
                    write["starting-register"] = 212;
                    write.items = [item("operation")];
                } else if (subtype === "level1") {
                    read.items.push(item("opid"));
                    read.items.push(item("state-hold-time", "o"));
                    read.items.push(item("position", "o"));
                    read.items.push(item("remain-time"));
                    
                    write = {};
                    write["starting-register"] = 212;
                    write.items = [item("operation"), item("opid"), item("time")];
                } else if (subtype === "level2") {
                    read.items.push(item("opid"));
                    read.items.push(item("state-hold-time", "o"));
                    read.items.push(item("position"));
                    read.items.push(item("remain-time"));
                    read.items.push(item("opentime"));
                    read.items.push(item("closetime"));
                    
                    write = {};
                    write["starting-register"] = 311;
                    write.items = [
                        item("operation"), 
                        item("opid"), 
                        item("time"),
                        item("position"),
                        item("opentime"),
                        item("closetime")
                    ];
                }
            } else if (type === "switch") {
                read.items = [
                    item("opid"),
                ];
    
                if (subtype === "level0") {
                    write = {};
                    write["starting-register"] = 311;
                    write.items = [item("operation")];
                } else if (subtype === "level1") {
                    read.items.push(item("opid"));
                    read.items.push(item("state-hold-time", "o"));
                    read.items.push(item("remain-time"));
                    
                    write = {};
                    write["starting-register"] = 311;
                    write.items = [item("operation"), item("opid"), item("hold-time")];
                } else if (subtype === "level2") {
                    read.items.push(item("opid"));
                    read.items.push(item("state-hold-time", "o"));
                    read.items.push(item("ratio"));
                    read.items.push(item("remain-time"));
                    
                    write = {};
                    write["starting-register"] = 311;
                    write.items = [
                        item("operation"), 
                        item("opid"), 
                        item("hold-time"),
                        item("ratio")
                    ];
                }
            } else if (type === "nutrient-supply") {
                read.items = [
                    item("status"),
                    item("area"),
                    item("alert"),
                ];

                if (subtype !== "level0" && subtype != null) {
                    read.items.push(item("opid"));

                    write = {};
                    write["starting-register"] = 311;
                    write.items = [
                        item("operation"),
                        item("opid"),
                    ];
                }

                if (subtype === "level2") {
                    write.items.push(item("on-sec"));
                    write.items.push(item("start-area"));
                    write.items.push(item("stop-area"));
                } else if (subtype === "level3") {
                    write.items.push(item("on-sec"));
                    write.items.push(item("start-area"));
                    write.items.push(item("stop-area"));
                    write.items.push(item("EC"));
                    write.items.push(item("pH"));
                }
            }
        }

        if (cls === "misc") {
            if (type === "display") {
                read["starting-register"] = 301;
                read.items = [
                    item("status"),
                    item("opid")
                ];
                
                write = {};
                write["starting-register"] = 401;
                write.items = [
                    item("operation"), 
                    item("opid"),
                    item("epoch"),
                    item("vfloat"),
                    item("vint")
                ];
            } else {
                read = null;
            }
            
        }

        if (read !== null)
            json.read = read;
        if (write !== null)
            json.write = write;

        return json;
    },
}

export default CommSpec;