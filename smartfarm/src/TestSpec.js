import React, { Component } from 'react';
import { Container, Row, Col, Dropdown, Button, Alert, FormControl } from 'react-bootstrap';
import * as Data from './data';

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

            this.state.devicespec = deviceSpec;

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
                            //<Row style={{margin:"10px"}}>
                            <div style={{border:"1px solid gray", padding:"10px", margin:"10px"}}>
                                Parameter
                                <Row>
                                { op.Parameters.map((param, idx) => (
                                    <Col key={idx} xs="auto">
                                        <Col xs="auto">
                                            {param.Parameter}
                                        </Col>
                                        <Col xs="auto">
                                            <input id={'param' + idx}></input>
                                        </Col>
                                    </Col>
                                )) }
                                </Row>
                            </div>
                            //</Row>
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
                //<Row style={{margin:"10px"}}>
                <div style={{border:"1px solid gray", padding:"10px", margin:"10px"}}>
                    Target
                    <Row>
                    { tgs.map((tg, idx) => (
                        <Col key={idx} xs="auto">
                            <Col xs="auto">
                                <label><input type="checkbox" id={"target" + idx}></input>{tg}</label>
                            </Col>
                        </Col>
                    )) }
                    </Row>
                </div>
                //</Row>
            )
        }
        return (<></>);
    }

    getExpect = () => {
        if (this.state.command !== "EXPECT") return (<></>);

        var tgs = this.state.targets[this.state.device];

        if (tgs) {
            return (
                //<Row style={{margin:"10px"}}>
                <div style={{border:"1px solid gray", padding:"10px", margin:"10px"}}>
                    Target
                    <Row>
                    { tgs.map((tg, idx) => (
                        <Col key={idx} xs="auto">
                            <Col xs="auto">
                                <label><input type="checkbox" id={"expectchk" + idx}></input>{tg}</label><input style={{width:"40px"}} id={"expect" + idx}></input>
                            </Col>
                        </Col>
                    )) }
                    </Row>
                </div>
                //</Row>
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
            
            var tgs = this.state.targets[this.state.device];

            if (tgs) {
                var tgsstr = "";
                for(var i=0; i<tgs.length; i++) {
                    var tg = tgs[i];

                    var chk = doc.getElementById('target' + i).checked;
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
            
            var tgs = this.state.targets[this.state.device];

            if (tgs) {
                var tgsstr = "";
                for(var i=0; i<tgs.length; i++) {
                    var tg = tgs[i];

                    var chk = doc.getElementById('expectchk' + i).checked;
                    if (chk) {
                        var val = doc.getElementById('expect' + i).value;
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
            var val = doc.getElementById('timeval').value;

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
        return (
            <div style={{height:"180px"}} ref={this.divRef}>
                <Container fluid style={{margin:"10px"}}>
                    <Row style={{marginLeft:"0px", marginBottom:"10px"}}>
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                this.setState({command:eventKey});
                            }}>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.command}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey={"SET"}>SET</Dropdown.Item>
                                    <Dropdown.Item eventKey={"GET"}>GET</Dropdown.Item>
                                    <Dropdown.Item eventKey={"EXPECT"}>EXPECT</Dropdown.Item>
                                    <Dropdown.Item eventKey={"SLEEP"}>SLEEP</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        { this.state.command !== "SLEEP" &&
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                this.setState({device:eventKey, operation:null});
                            }}>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.device ? this.state.device : "DEVICE"}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {this.state.deviceList.map((dvc, idx) => (
                                        <Dropdown.Item key={idx} eventKey={dvc}>{dvc}</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>}
                        {/* this.state.command === "SET" &&
                        <Col xs="auto">
                            <Button variant="secondary" disabled>opid</Button>
                        </Col>*/}
                        { this.state.command === "SET" &&
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                this.setState({operation:eventKey});
                            }}>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.operation ? this.state.operation : "OPERATION"}
                                </Dropdown.Toggle>
                                {this.state.operations[this.state.device] &&
                                <Dropdown.Menu>
                                    {this.state.operations[this.state.device].map((op, idx) => (
                                        <Dropdown.Item key={idx} eventKey={op.Operation}>{op.Operation}</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>}
                            </Dropdown>
                        </Col>}
                        <Col xs="auto">
                            <Button variant="secondary" style={{width:"80px"}}
                                onClick={this.onCreate}>추가</Button>
                        </Col>
                    </Row>
                    <Row>
                        { this.getParameter() }
                    </Row>
                    <Row>
                        { this.getTarget() }
                    </Row>
                    <Row>
                        { this.getExpect() }
                    </Row>
                    { this.state.command === "SLEEP" &&
                    <Row>
                        <Col xs="auto">
                            <Col xs="auto">
                                Time(ms)
                            </Col>
                            <Col xs="auto">
                                <input id="timeval"></input>
                            </Col>
                        </Col>
                    </Row> }
                </Container>
            </div>
        );
    }
}