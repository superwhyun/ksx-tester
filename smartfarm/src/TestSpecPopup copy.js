import React, { Component } from 'react';
import { Container, Row, Col, Dropdown, Button, Alert, FormControl } from 'react-bootstrap';
import NewWindow from 'react-new-window'
import * as Data from './data';
import TestSpec from './TestSpec'


export default class TestSpecPopup extends Component {
    state = {
        command : "SET",
        device : null,
        deviceList : [],
        operations:{},
        targets:{},
        operation:null,

    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps) {

    }

    setDeviceSpec = (deviceSpec) => {
        if (deviceSpec) {
            var dvclist = [];
            var operation = {};
            var target = {};

            if (deviceSpec.Class) {
                dvclist.push(deviceSpec.Class);

                if (deviceSpec.CommSpec) {
                    var it = Data.getCommSpecItems(deviceSpec.CommSpec);

                    if (it)
                        target[deviceSpec.Class] = it.read;
                }

                var op = Data.getCommSpecOperation(deviceSpec.Class, deviceSpec.Type);

                if (op) {
                    operation[deviceSpec.Class] = op;
                }
            }
    
            if (deviceSpec.Devices) {
                var idx = 0;
                deviceSpec.Devices.map((dvc) => {
                    var name = idx++ + ":" + dvc.Class;
                    if (dvc.Name) {
                        name += "(" + dvc.Name + ")";
                    }
                    dvclist.push(name);

                    if (dvc.CommSpec) {
                        var it = Data.getCommSpecItems(dvc.CommSpec);

                        if (it)
                            target[name] = it.read;
                    }

                    var op = Data.getCommSpecOperation(dvc.Class, dvc.Type);

                    if (op) {
                        operation[name] = op;
                    }
                });
            }
    
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
                                            <input></input>
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
        if (this.state.command !== "GET" && this.state.command !== "EXPECT") return (<></>);

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
                                <label><input type="checkbox" value={tg} checked></input>{tg}</label>
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
        var json = {};
        json.command = this.state.command;

        if (this.state.command === "SET") {
            var device = this.state.device;
            if (device.indexOf(":")) {
                var spl = device.split(":");
                device = spl[0];
            }
            json.device = device;
            json.operation = this.state.operation.toUpperCase();
        }

        this.props.onCreate(json);
    }

    onUnload = () => {
        this.setState({
            command : "SET",
            device : null,
            deviceList : [],
            operations:{},
            targets:{},
            operation:null
        })
    }

    render() {
        //const rtc = this.props.route.params.RtcConnect;
        return (
            <>
                {this.props.show &&
                <NewWindow onUnload={this.onUnload} center={"parent"} title={"예외요청 생성"} features={{width:800, height:250}}>
                    <div >
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
                            { this.state.command === "SET" &&
                            <Col xs="auto">
                                <Button variant="secondary" disabled>opid</Button>
                            </Col>}
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
                        </Row>
                        <Row>
                            { this.getParameter() }
                        </Row>
                        <Row>
                            { this.getTarget() }
                        </Row>
                        { this.state.command === "SLEEP" &&
                        <Row>
                            <Col xs="auto">
                                <Col xs="auto">
                                    Time
                                </Col>
                                <Col xs="auto">
                                    <input></input>
                                </Col>
                            </Col>
                        </Row> }
                    </Container>
                    <Button variant="secondary" style={{width:"80px", position:"absolute", bottom:"20px", right:"20px"}}
                        onClick={this.onCreate}>생성</Button>
                    </div>
                </NewWindow>}
            </>
        );
    }
}