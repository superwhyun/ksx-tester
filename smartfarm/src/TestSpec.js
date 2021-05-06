import React, { Component } from 'react';
import * as Data from './data';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
import { Panel } from 'primereact/panel';

export default class TestSpec extends Component {
    state = {
        command : "SET",
        device : null,
        deviceList : [],
        operations:{},
        targets:{},
        operation:null,
        devicespec:null,
    }

    constructor(props) {
        super(props);
        
        /*if (props.deviceSpec)
            this.setDeviceSpec(props.deviceSpec, true);*/
        this.divRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.deviceSpec)
            this.setDeviceSpec(this.props.deviceSpec, true);
    }

    componentDidUpdate(prevProps) {
        
    }

    setDeviceSpec = (deviceSpec, full = false) => {

        if (deviceSpec) {

            if (Object.equals(deviceSpec, this.state.devicespec)) {
                console.log('same');
                return;
            }

            this.setState({devicespec:deviceSpec});

            var dvclist = [];
            var operation = {};
            var target = {};

            if (deviceSpec.Class) {
                dvclist.push(deviceSpec.Class);

                if (deviceSpec.CommSpec) {
                    var it = null;
                    if (full) {
                        it = Data.getCommSpecItemsFull(deviceSpec);
                    } else {
                        it = Data.getCommSpecItems(deviceSpec.CommSpec);
                    }

                    if (it)
                        target[deviceSpec.Class] = it.read;
                }

                var op = null;
                if (full) {
                    op = Data.getCommSpecOperationFull(deviceSpec.Class, deviceSpec.Type);
                } else {
                    op = Data.getCommSpecOperation(deviceSpec.Class, deviceSpec.Type);
                }

                if (op) {
                    operation[deviceSpec.Class] = op;
                }
            }
    
            if (deviceSpec.Devices) {
                var idx = 0;
                deviceSpec.Devices.map((dvc) => {
                    var name = idx++ + ":" + dvc.Class;
                    if (dvc.Name) {
                        name += ":" + dvc.Name;
                    }
                    dvclist.push(name);

                    if (dvc.CommSpec) {
                        var it = null;
                        if (full) {
                            it = Data.getCommSpecItemsFull(dvc);
                        } else {
                            it = Data.getCommSpecItems(dvc.CommSpec);
                        }

                        if (it)
                            target[name] = it.read;
                    }

                    var op = null;
                    if (full) {
                        op = Data.getCommSpecOperationFull(dvc.Class, dvc.Type);
                    } else {
                        op = Data.getCommSpecOperation(dvc.Class, dvc.Type);
                    }
                    if (op) {
                        operation[name] = op;
                    }

                    return dvc;
                });
            }

            //this.state.deviceList = dvclist;
            //this.state.operations = operation;
            //this.state.targets = target;
            this.setState({deviceList:dvclist, operations:operation, targets:target});
        }
    }

    getParameter = () => {
        if (this.state.command !== "SET") return (<></>);

        var ops = this.state.operations[this.state.device];

        if (ops) {
            for(var i=0; i<ops.length; i++) {
                var op = ops[i];
                
                if (op.Operation === this.state.operation) {
                    if (op.Parameters) {
                        return (
                            <Panel header="Parameter">
                                <div className="p-d-flex">
                                    { op.Parameters.map((param, idx) => (
                                        <div key={idx} className="p-inputgroup" style={{width:"200px",marginRight:"10px"}}>
                                            <span className="p-inputgroup-addon">{param.Parameter}</span>
                                            <InputText id={'param' + idx}></InputText>
                                        </div>
                                    )) }
                                </div>
                            </Panel>
                        )
                    }

                    break;
                }
            }
        }
        return (<></>);
    }

    getTarget = () => {
        if (this.state.command !== "GET") return (<></>);

        var tgs = this.state.targets[this.state.device];

        if (tgs) {
            return (
                <Panel header="Target">
                    <div className="p-grid">
                        { tgs.map((tg, idx) => (
                            <div key={idx} className="p-col-fixed">
                                <div className="p-inputgroup">
                                    <span className="p-inputgroup-addon">
                                        <input type="checkbox" id={"target" + idx}/>
                                    </span>
                                    <span className="p-inputgroup-addon">{tg}</span>
                                </div>
                            </div>
                        )) }
                    </div>
                </Panel>
            )
        }
        return (<></>);
    }

    getExpect = () => {
        if (this.state.command !== "EXPECT") return (<></>);

        var tgs = this.state.targets[this.state.device];

        if (tgs) {
            return (
                <Panel header="Target">
                    <div className="p-grid">
                        { tgs.map((tg, idx) => (
                            <div key={idx} className="p-col-fixed">
                                <div className="p-inputgroup">
                                    <span className="p-inputgroup-addon">
                                        <input type="checkbox" id={"expectchk" + idx}/>
                                    </span>
                                    <span className="p-inputgroup-addon">{tg}</span>
                                    <InputText style={{width:"60px"}} id={"expect" + idx}></InputText>
                                </div>
                            </div>
                        )) }
                    </div>
                </Panel>
            )
        }
        return (<></>);
    }

    onCreate = () => {

        var doc = this.divRef.current.ownerDocument;

        if (!this.state.deviceList || this.state.deviceList.length <= 0) {
            alert('장비 규격 파일을 불러와야 합니다.');
            return;
        }

        var json = {};
        json.command = this.state.command;

        if (this.state.command === "SET") {

            if (!this.state.device) {
                alert('DEVICE를 선택해야 합니다.');
                return;
            }

            if (!this.state.operation) {
                alert('OPERATION을 선택해야 합니다.');
                return;
            }

            var device = this.state.device;
            /*if (device.indexOf("-")) {
                var spl = device.split("-");
                device = spl[0];
            }*/
            json.device = device;
            json.operation = this.state.operation;

            var ops = this.state.operations[this.state.device];

            if (ops) {
                for(var i=0; i<ops.length; i++) {
                    var op = ops[i];
                    
                    if (op.Operation === this.state.operation) {
                        if (op.Parameters) {
                            json.parameters = [];
                            for(var j=0; j<op.Parameters.length; j++) {
                                var param = op.Parameters[j];
                                
                                var par = {};
                                par = Object.assign(par, param);
                                par = Object.assign(par, {value:doc.getElementById('param' + j).value});

                                if (!par.value && par.MO === 'm') {
                                    alert('Parameter ' + par.Parameter + '를 입력해야 합니다.');
                                    return;
                                }

                                json.parameters.push(par);
                            }
                        }
                    }
                }
            }
        } else if (this.state.command === "GET") {
            if (!this.state.device) {
                alert('DEVICE를 선택해야 합니다.');
                return;
            }

            json.device = this.state.device;
            
            let tgs = this.state.targets[this.state.device];

            if (tgs) {
                let tgsstr = "";
                for(i=0; i<tgs.length; i++) {
                    let tg = tgs[i];

                    let chk = doc.getElementById('target' + i).checked;
                    if (chk) {
                        if (tgsstr.length > 0)
                            tgsstr += ",";
                        
                        tgsstr += tg;
                    }
                }

                if (tgsstr.length <= 0) {
                    alert("하나 이상의 Target을 선택해야 합니다.");
                    return;
                }

                json.targets = tgsstr;
            }
        } else if (this.state.command === "EXPECT") {
            if (!this.state.device) {
                alert('DEVICE를 선택해야 합니다.');
                return;
            }

            json.device = this.state.device;
            
            let tgs = this.state.targets[this.state.device];

            if (tgs) {
                let tgsstr = "";
                for(i=0; i<tgs.length; i++) {
                    let tg = tgs[i];

                    let chk = doc.getElementById('expectchk' + i).checked;
                    if (chk) {
                        let val = doc.getElementById('expect' + i).value;
                        if (!val) {
                            alert("선택한 Target의 값을 입력해야 합니다.");
                            return;
                        }

                        if (tgsstr.length > 0)
                            tgsstr += ",";
                        
                        tgsstr += tg + ":" + val;
                    }
                }

                if (tgsstr.length <= 0) {
                    alert("하나 이상의 Target을 선택해야 합니다.");
                    return;
                }

                json.targets = tgsstr;
            }
        } else if (this.state.command === "SLEEP") {
            let val = doc.getElementById('timeval').value;

            if (!val) {
                alert("시간값을 입력해야 합니다.");
                return;
            }

            json.time = val;
        }

        this.props.onCreate(json);
    }

    render() {
        //const rtc = this.props.route.params.RtcConnect;
        //options={this.state.operations[this.state.device] ? this.state.operations[this.state.device] : null}
        return (
            <div style={{height:"240px"}} ref={this.divRef}>
                <div className="p-grid p-justify-between">
                <div className="p-grid p-justify-start" style={{margin:"0px"}}>
                    <div className="p-col-fixed" style={{marginRight:"0px",width:"240px"}}>
                        <Dropdown value={this.state.command} onChange={(e) => {
                            this.setState({command:e.value}); }}
                            options={["SET","GET", "EXPECT","SLEEP"]}>
                        </Dropdown>
                    </div>
                    {
                        this.state.command !== "SLEEP" &&
                        <div className="p-col-fixed" style={{marginRight:"0px",width:"240px"}}>
                            <Dropdown value={this.state.device} placeholder="DEVICE" onChange={(e) => {
                                this.setState({device:e.value, operation:null}); }}
                                options={this.state.deviceList}>
                            </Dropdown>
                        </div>
                    }
                    {
                        this.state.command === "SET" &&
                        <div className="p-col-fixed" style={{marginRight:"0px",width:"240px"}}>
                            <Dropdown value={this.state.operation} placeholder="OPERATION" onChange={(e) => {
                                this.setState({operation:e.value}); }}
                                optionLabel="Operation" optionValue="Operation"
                                options={this.state.operations[this.state.device]}>
                            </Dropdown>
                        </div>
                    }
                </div>
                <div className="p-col"></div>
                    <div className="p-col-fixed">
                        <Button className="p-button-secondary" label="추가" style={{width:"80px"}}
                            onClick={this.onCreate}></Button>
                    </div>
                    </div>
                <div>
                    { this.getParameter() }
                    { this.getTarget() }
                    { this.getExpect() }
                    {
                        this.state.command === "SLEEP" &&
                        <div className="p-inputgroup" style={{width:"230px"}}>
                            <span className="p-inputgroup-addon" style={{width:"130px"}}>Time(ms)</span>
                            <InputText id="timeval"></InputText>
                        </div>
                    }
                </div>
            </div>
        );
    }
}