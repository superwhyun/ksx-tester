import React, { Component } from 'react';
import { Container, Dropdown, Row, Col, Button, Alert } from 'react-bootstrap';
import * as Data from './data'
//import CommSpec from './CommSpec'
//import NewWindow from 'react-new-window'
import CommSpecComponent from './CommSpecComponent'
import DeviceSpecPopup from './DeviceSpecPopup'

export default class EquipManage extends Component {
    state = {
        //files : null,
        //selectFile : null,
        //fileJson : null,
        showFiles : false,
        //addDeviceMessage : null,
        class : null,
        model : null,
        type : null,
        subtype : null,
        name : null,
        valueunit : null,
        valueunitetc : null,
        sd : null,
        channel : null,
        deviceSpecName : null,
        saveAlert : false,
        saveResult : true,
        saveErrorMessage : null,
        overwrite : false,
        overwriteMessage : false,
        addDeviceList : {},
        refresh : null,
    }

    constructor(props) {
        super(props);

        this.csCmpRef = React.createRef();
        this.dvcPopRef = React.createRef();
    }

    setModel = () => {
        this.setState({model:document.getElementById('modelInput').value});
    }

    setName = () => {
        this.setState({name:document.getElementById('nameInput').value});
    }

    setChannel = () => {
        this.setState({channel:document.getElementById('channelInput').value});
    }

    setValueUnitEtc = () => {
        this.setState({valueunitetc:document.getElementById('valueUnitInput').value});
    }

    setDeviceSpecName = () => {
        this.setState({deviceSpecName:document.getElementById('deviceSpecNameInput').value});
    }

    setSaveMsg = (result, msg) => {
        this.setState({saveResult:result, saveErrorMessage:msg, saveAlert:true});
    }

    overwriteClick = () => {
        this.setState({overwrite:true, overwriteMessage:false, saveAlert:false}, () => {
            this.saveClick();
            this.setState({overwrite:false});
        });
    }

    onShowFiles = () => {
        //this.getFiles();
        this.setState({showFiles:false}, () => {
            this.setState({showFiles:true});
        });
    }

    onModify = (json, name) => {
        /*if (this.state.selectFile == null || this.state.fileJson == null) {
            this.setState({addDeviceMessage:"수정할 장비 규격 파일을 선택하세요."});
            return;
        }*/

        this.setJson(json);
        document.getElementById('deviceSpecNameInput').value = name;
        this.setDeviceSpecName();
    }

    onCommSpecChange = () => {
        this.setState({refresh:null});
    }

    setJson = (json) => {

        if (json.Class) {
            this.setState({class:json.Class}, () => {
                this.csCmpRef.current.setCommSpec(json.CommSpec);
                this.dvcPopRef.current.setClass(this.state.class);
            });
        }

        if (json.Type) {
            if (json.Type.indexOf('/') > 0) {
                var types = json.Type.split('/');
                this.setState({type:types[0], subtype:types[1]});
            } else {
                this.setState({type:json.Type, subtype:null});
            }
        }

        if (json.Model && json.Model !== "null") {
            this.setState({model:json.Model});
            document.getElementById('modelInput').value = json.Model;
        }

        if (json.Name && json.Name !== "null") {
            this.setState({name:json.Name});
            document.getElementById('nameInput').value = json.Name;
        }

        if (json.ValueUnit) {
            if (json.ValueType === "string") {
                this.setState({valueunitetc:json.ValueUnit, valueunit:"etc"}, () => {
                    document.getElementById('valueUnitInput').value = json.ValueUnit;
                });
            } else {
                this.setState({valueunitetc:null, valueunit:json.ValueUnit});
            }
        }

        if (json.SignificantDigit !== undefined && json.SignificantDigit !== null) {
            console.log(json.SignificantDigit);
            this.setState({sd:json.SignificantDigit});
        }

        if (json.Channel) {
            this.setState({channel:json.Channel}, () => {
                document.getElementById('channelInput').value = json.Channel;
            });
        }

        if (json.Devices && json.Devices.length > 0) {
            var dvclist = {};
            
            json.Devices.map((dvc, idx) => {
                dvclist['tmp' + idx] = dvc;
            });

            this.setState({addDeviceList:dvclist});
        }
    }
/*
    onFilesUnload = () => {
        this.setState({showFiles:false, files:null, selectFile:null, fileJson:null});
    }

    getFiles = () => {

        fetch("/devicespeclist", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET'
        }).then(res => res.json())
        .then(
            (result) => {
                if (result.result !== "success") {
                    alert("파일 검색 실패! " + result.errormsg);
                } else {
                    this.setState({files:result.files});
                }
            },
            (error) => {
                alert("파일 검색 실패! " + error);
            }
        )
    }

    onListSelect = (file) =>{
        this.setState({selectFile:file});

        fetch("/devicespec?file=" + file, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET'
        }).then(res => res.json())
        .then(
            (result) => {
                if (result.result !== "success") {
                    alert("파일 검색 실패! " + result.errormsg);
                } else {
                    this.setState({fileJson:result.json});
                }
            },
            (error) => {
                alert("파일 검색 실패! " + error);
            }
        )
    }

    onRemoveFile = () =>{
        
        if (this.state.selectFile == null) {
            this.setState({addDeviceMessage:"삭제할 장비 규격 파일을 선택하세요."});
            return;
        }

        fetch("/devicespec?file=" + this.state.selectFile, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE'
        }).then(res => res.json())
        .then(
            (result) => {
                if (result.result !== "success") {
                    alert("파일 삭제 실패! " + result.errormsg);
                } else {
                    this.onShowFiles();
                }
            },
            (error) => {
                alert("파일 삭제 실패! " + error);
            }
        )
    }
*/
    onAddDevice = (name, json) => {

        /*if (this.state.selectFile == null || this.state.fileJson == null) {
            this.setState({addDeviceMessage:"추가할 장비 규격 파일을 선택하세요."});
            return;
        }*/

        this.state.addDeviceList[name] = json;
        this.setState({addDeviceList:this.state.addDeviceList});
    }

    onRemoveFromDeviceList = (file) => {
        delete this.state.addDeviceList[file];
        this.setState({addDeviceList:this.state.addDeviceList});
    }


    saveClick = () => {

        // 문법검사필요
        // starting register 생략 가능 (노드 제외)
        if (!this.state.deviceSpecName) {
            this.setSaveMsg(false, '장비 규격 이름을 입력하세요.');
            return;
        }

        fetch("/devicespec", {
            body: JSON.stringify({
                name: this.state.deviceSpecName,
                overwrite: this.state.overwrite,
                json: this.getJson()}),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT'
        }).then(res => res.json())
        .then(
            (result) => {
                if (result.result === "error") {
                    this.setSaveMsg(false, result.errormsg);
                } else if (result.result === "duplicate") {
                    this.state.overwriteMessage = true;
                    this.setSaveMsg(false, null);
                } else if (result.result === "success") {
                    this.setSaveMsg(true, result.file);
                } else {
                    this.setSaveMsg(false, result.errormsg);
                }
            },
            (error) => {
                this.setSaveMsg(false, error);
            }
        )
    }

    isSensor = () => {
        if(this.state.class === 'sensor') return true;
        else return false;
    }

    getJson = () => {
        var json = {};
        json.Class = this.state.class;
        json.Type = this.state.type;
        if (this.state.subtype != null)
            json.Type += '/' + this.state.subtype;

        if (this.state.model != null && this.state.model.length > 0)
            json.Model = this.state.model;

        if (this.state.name != null && this.state.name.length > 0)
            json.Name = this.state.name;

        if (this.isSensor()) {
            if (this.state.valueunit === 'etc') {
                json.ValueUnit = this.state.valueunitetc;
                json.ValueType = "string";
            } else {
                json.ValueUnit = parseInt(this.state.valueunit);
                json.ValueType = "float";
            }
            
            if (this.state.sd !== 'None' && this.state.sd !== null) {
                json.SignificantDigit = parseInt(this.state.sd);
            }
        }

        if (this.state.class != null) {
            if (this.state.class !== 'node') {
                if (this.state.channel !== null && this.state.channel.length > 0) {
                    var chn = parseInt(this.state.channel);
                    if (!isNaN(chn)) {
                        json.Channel = chn;
                    }
                }       
            }

            //json.CommSpec = CommSpec.getCommSpec(this.state.class, this.state.type, this.state.subtype);
            //if (this.state.commSpec !== null)
            //    json.CommSpec = this.state.commSpec;
            if (this.csCmpRef && this.csCmpRef.current) {
                var cs = this.csCmpRef.current.getCommSpec();
                if (cs)
                    json.CommSpec = cs;
            }
                

            if (this.state.class === 'node') {
                if (Object.keys(this.state.addDeviceList).length > 0) {
                    var devices = [];
                    Object.keys(this.state.addDeviceList).map((key) => {
                        devices.push(this.state.addDeviceList[key]);
                        return null;
                    });

                    json.Devices = devices;
                }
            }
        }
        
        return json;
    }
    
    render() {

        var itemKey = 0;

        return (
            <>
                <DeviceSpecPopup 
                    ref={this.dvcPopRef}
                    show={this.state.showFiles} modify={true}
                    onModify={this.onModify}
                    onAddDevice={this.onAddDevice}></DeviceSpecPopup>
                <Container fluid style={{margin:"10px"}}>
                <Row style={{marginBottom:"20px", marginLeft:"10px"}}>
                    <Button variant="secondary" size="sm" style={{width:"200px"}}
                        onClick={this.onShowFiles}>장비 규격 파일 검색</Button>
                </Row>
                <Row>
                <Col>
                    <Row style={{marginBottom:"10px"}}>
                        <Col style={{width:"120px"}} xs="auto">
                            Class
                        </Col>
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                if (this.state.class !== eventKey) {
                                    this.setState({type:null, subtype:null, valueunit:null, addDeviceList:{}, commSpec:null}, () => {
                                        this.csCmpRef.current.setCommSpec(null);
                                        this.dvcPopRef.current.setClass(this.state.class);
                                    });
                                }

                                this.setState({class:eventKey});
                            }}>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.class == null ? 'Class' : this.state.class}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    { Data.deviceClasses.map(cls => (
                                        <Dropdown.Item key={itemKey++} eventKey={cls}>{cls}</Dropdown.Item>
                                    )) }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>

                    <Row style={{marginBottom:"10px"}}>
                        <Col xs="auto" style={{width:"120px"}}>
                            Type
                        </Col>
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                this.csCmpRef.current.setCommSpec(null);
                                this.setState({type:eventKey});
                            }}>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.type == null ? 'Type' : this.state.type }
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    { Data.getDeviceTypes(this.state.class).map(type => (
                                        <Dropdown.Item key={itemKey++} eventKey={type}>{type}</Dropdown.Item>
                                    )) }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                this.csCmpRef.current.setCommSpec(null);
                                this.setState({subtype:eventKey});
                            }}>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.subtype == null ? 'SubType' : this.state.subtype }
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    { Data.getDeviceSubTypes(this.state.type).map(subtype => (
                                        <Dropdown.Item key={itemKey++} eventKey={subtype}>{subtype}</Dropdown.Item>
                                    )) }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>

                    <Row style={{marginBottom:"10px"}}>
                        <Col xs="auto" style={{width:"120px"}}>
                            Model
                        </Col>
                        <Col xs="auto">
                            <input id="modelInput" onKeyUp={this.setModel} ></input>
                        </Col>
                    </Row>

                    <Row style={{marginBottom:"10px"}}>
                        <Col xs="auto" style={{width:"120px"}}>
                            Name
                        </Col>
                        <Col xs="auto">
                            <input id="nameInput" onKeyUp={this.setName} ></input>
                        </Col>
                    </Row>
                    { this.isSensor() && 
                    <Row style={{marginBottom:"10px"}}>
                        <Col style={{width:"120px"}} xs="auto">
                            ValueUnit
                        </Col>
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                if (eventKey === 'etc' && this.state.valueunit !== 'etc')
                                    this.setState({valueunitetc:null});

                                this.setState({valueunit:eventKey});
                            }}>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.valueunit == null ? 'ValueUnit' : this.state.valueunit}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    { Data.valueUnit.map(cls => (
                                        <Dropdown.Item key={itemKey++} eventKey={cls}>{cls}</Dropdown.Item>
                                    )) }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        { this.state.valueunit === 'etc' &&
                            <Col xs="auto">
                                <input id="valueUnitInput" onKeyUp={this.setValueUnitEtc} ></input>
                            </Col>
                        }
                    </Row> }
                    { this.isSensor() && 
                    <Row style={{marginBottom:"10px"}}>
                        <Col style={{width:"120px"}} xs="auto">
                            SignificantDigit
                        </Col>
                        <Col xs="auto">
                            <Dropdown onSelect={(eventKey, event) => {
                                this.setState({sd:eventKey});
                            }}>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {this.state.sd == null ? 'SD' : this.state.sd}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    { Data.sd.map(cls => (
                                        <Dropdown.Item key={itemKey++} eventKey={cls}>{cls}</Dropdown.Item>
                                    )) }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row> }
                    { this.state.class !== 'node' && 
                    <Row style={{marginBottom:"10px"}}>
                        <Col xs="auto" style={{width:"120px"}}>
                            Channel
                        </Col>
                        <Col xs="auto">
                            <input id="channelInput" onKeyUp={this.setChannel}></input>
                        </Col>
                    </Row> }
                    
                    <Row style={{marginBottom:"10px"}}>
                        <CommSpecComponent 
                            ref={this.csCmpRef} 
                            cls={this.state.class} type={this.state.type} subtype={this.state.subtype} onChanged={this.onCommSpecChange}>
                        </CommSpecComponent>
                    </Row>
                    
                    { this.state.class === 'node' && 
                    <Row style={{marginBottom:"10px"}}>
                        <Button variant="secondary" size="sm" style={{width:"200px"}}
                        onClick={this.onShowFiles}>Device 추가</Button>
                    </Row>
                    }
                    { this.state.class === 'node' && Object.keys(this.state.addDeviceList).length > 0 &&
                        /*<>
                        {Object.keys(this.state.addDeviceList).map((key, idx) => (
                            <Row key={idx}>
                                <Alert variant="secondary" dismissible onClose={()=> this.onRemoveFromDeviceList(key)}>{key}</Alert>
                            </Row>
                        ))}
                        </>*/
                        <div className="heightDevice">
                        {Object.keys(this.state.addDeviceList).map((key, idx) => (
                            <div key={idx}><div style={{width:"300px", height:"33px", border:"1px solid gray", background:"#e2e2e2", borderRadius:"4px", paddingLeft:"5px", marginBottom:"-20px"}}>
                                <p style={{width:"200px", display:"inline", verticalAlign:"middle"}}>{key}</p>
                                <Button style={{float:"right"}} size="sm" variant="danger" onClick={()=> this.onRemoveFromDeviceList(key)}>X</Button>
                            </div><br/></div>
                        ))}
                        </div>
                    }
                </Col>

                
                <Col style={{borderLeft:"5px solid gray"}}>
                    <pre className="heightLine">
                        <code>
                            {JSON.stringify(this.getJson(), null, 4)}
                        </code>
                    </pre>
                </Col>
                </Row>
                {/*<Row style={{marginTop:"10px"}}>
                    {this.state.saveAlert && 
                        <Alert variant={ this.state.saveResult ? "success" : "danger" } onClose={() => this.setState({saveAlert:false})} dismissible>
                            <Alert.Heading>{ this.state.saveResult ? "파일 저장 성공!" : "파일 저장 실패!" }</Alert.Heading>
                            {this.state.saveErrorMessage && <p>{this.state.saveErrorMessage}</p>}
                            {this.state.overwriteMessage && 
                                <>
                                    <p>동일한 이름의 장비 규격 파일이 있습니다. 덮어쓰시겠습니까?</p>
                                    <hr/>
                                    <div className="d-flex justify-content-end">
                                        <Button style={{marginRight:"10px"}} onClick={this.overwriteClick} variant="outline-success">
                                            예
                                        </Button>
                                        <Button onClick={() => {
                                            this.state.overwriteMessage = false;
                                            this.setState({saveAlert:false});
                                            }} variant="outline-danger">
                                            아니요
                                        </Button>
                                    </div>
                                </>
                            }
                        </Alert>
                    }
                </Row>*/}
                <Row style={{marginTop:"10px"}}>
                    <Col xs="auto" style={{width:"130px"}}>
                        장비 규격 이름
                    </Col>
                    <Col xs="auto">
                        <input style={{width:"400px"}} id="deviceSpecNameInput" onKeyUp={this.setDeviceSpecName}></input>
                    </Col>
                    <Col xs="auto">
                        <Button variant="secondary" size="sm" style={{width:"100px"}}
                        onClick={this.saveClick}>저장</Button>
                    </Col>
                </Row>
            </Container>
            {this.state.saveAlert && 
                <div style={{position:"absolute", bottom:"70px", left:"10px", opacity:"0.95"}}>
                <Alert variant={ this.state.saveResult ? "success" : "danger" } onClose={() => this.setState({saveAlert:false})} dismissible>
                    <Alert.Heading>{ this.state.saveResult ? "파일 저장 성공!" : "파일 저장 실패!" }</Alert.Heading>
                    {this.state.saveErrorMessage && <p>{this.state.saveErrorMessage}</p>}
                    {this.state.overwriteMessage && 
                        <>
                            <p>동일한 이름의 장비 규격 파일이 있습니다. 덮어쓰시겠습니까?</p>
                            <hr/>
                            <div className="d-flex justify-content-end">
                                <Button style={{marginRight:"10px"}} onClick={this.overwriteClick} variant="outline-success">
                                    예
                                </Button>
                                <Button onClick={() => {
                                    //this.state.overwriteMessage = false;
                                    this.setState({saveAlert:false, overwriteMessage:false});
                                    }} variant="outline-danger">
                                    아니요
                                </Button>
                            </div>
                        </>
                    }
                </Alert>
                </div>
            }
            </>            
        );
    }
}