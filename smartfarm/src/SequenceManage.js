import React, { Component } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import DeviceSpecPopup from './DeviceSpecPopup'
import TestSpecPopup from './TestSpecPopup'
import TestSpecListPopup from './TestSpecListPopup'
import TestSpec from './TestSpec'
import './SequenceManage.css'
import ExcuteTest from "./ExcuteTest";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

export default class SequenceManage extends Component {
    state = {
        showFiles : false,
        showTestFiles : false,
        loadJson : null,
        loadFile : null,
        showCreate : false,
        showTest : false,
        tests : [],
        saveAlert : false,
        saveResult : false,
        overwrite : false,
        saveErrorMessage : null,
        overwriteMessage : null,
        rowSelected : null
    }

    constructor(props) {
        super(props);

        this.dvcPopRef = React.createRef();
        this.testRef = React.createRef();
        this.testListRef = React.createRef();
        this.testPopRef = React.createRef();
        this.excuteTestRef = React.createRef();
    }

    onShowFiles = () => {
        //this.getFiles();
        this.setState({showFiles:false}, () => {
            this.setState({showFiles:true});
        });
    }

    onShowTestFiles = () => {
        //this.getFiles();
        this.setState({showTestFiles:false}, () => {
            this.setState({showTestFiles:true});
        });
    }

    onLoad = (json, name) => { 
        this.setState({loadJson:json, loadFile:name, showFiles:false});
        this.testRef.current.setDeviceSpec(json);
    }

    onTestLoad = (data, name) => { 
        var datas = data.split("\n");
        var tests = []
        datas.map((test,id) => {
            if (test.trim().length > 0)
                tests.push({id:id,test:test});
        });

        document.getElementById('testSpecNameInput').value = name;
        this.setState({tests:tests, showTestFiles:false});
        //this.testRef.current.setDeviceSpec(json);
    }

    onCreateTest = () => {

        if (this.state.loadFile === null) {
            alert('장비 규격 파일을 불러와야 합니다.');
            return;
        }

        this.setState({showCreate:false}, () => {
            this.testPopRef.current.setDeviceSpec(this.state.loadJson, true);
            this.setState({showCreate:true});
        });
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

    getTestSpec = () => {
        /*var testSpec = "";

        this.state.tests.map((test, idx) => {
            testSpec += test + "\n";
        });

        return testSpec;*/
        return this.state.tests;
    }

    saveClick = () => {
        var testSpecName = document.getElementById('testSpecNameInput').value;
        if (!testSpecName) {
            this.setSaveMsg(false, '시험파일 이름을 입력하세요.');
            return;
        }

        let testSpec = this.getTestSpec();

        if (!testSpec || testSpec.length <= 0) {
            this.setSaveMsg(false, '저장할 시험파일 내용이 없습니다.');
            return;
        }

        fetch("/testspec", {
            body: JSON.stringify({
                name: testSpecName,
                overwrite: this.state.overwrite,
                data: testSpec}),
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

    onCreate = (json) => {
        if (!json) return;
        //console.log(json);
        var cmd = json.command + " ";
        if (json.command === "SET") {
            cmd += "DEVICE=" + json.device + " ";
            cmd += "OPERATION=" + json.operation;

            if (json.parameters && json.parameters.length > 0) {
                var paramstr = "";
                for(var i=0; i<json.parameters.length; i++) {
                    var param = json.parameters[i];

                    if (param.value) {
                        if (paramstr.length > 0) 
                            paramstr += ",";
                        paramstr += param.Parameter;
                        paramstr += ":" + param.value;
                    }
                }

                if (paramstr.length > 0) 
                    cmd += " PARAMETER=" + paramstr;
            }
        } else if (json.command === "GET") {
            cmd += "DEVICE=" + json.device + " ";

            if (json.targets) {
                cmd += "TARGET=" + json.targets;
            }
        } else if (json.command === "EXPECT") {
            cmd += "DEVICE=" + json.device + " ";

            if (json.targets) {
                cmd += "TARGET=" + json.targets;
            }
        } else if (json.command === "SLEEP") {
            cmd += "TIME=" + json.time; 
        }

        this.state.tests.push({id:this.state.tests.length,test:cmd});
        this.setState({tests:this.state.tests});
        
    }

    testClick = () => {
        if (this.state.loadFile === null) {
            alert('장비 규격 파일을 불러와야 합니다.');
            return;
        }

        let testSpec = this.getTestSpec();

        if (!testSpec || testSpec.length <= 0) {
            alert('시험할 내용이 없습니다.');
            return;
        }

        this.setState({showTest:true}, () => {
            this.excuteTestRef.current.setSpec(this.state.loadJson, testSpec);
        });
    }

    testUnload = () => {
        this.setState({showTest:false});
    }

    onRowReorder = (e) => {
        if (this.state.rowSelected == null) {
            this.setState({tests:e.value});
        } else {
            let mvitem = [];
            let mvid = [];

            this.state.rowSelected.map((item) => {
                mvid.push(item.id);
            });

            this.state.tests.map((item) => {
               if (mvid.indexOf(item.id) >= 0) {
                   mvitem.push({id:item.id, test:String(item.test)});
                   item.test = '!@!@!';
               }
            });

            for(let i=mvitem.length - 1; i>=0; i--) {
                this.state.tests.splice(e.dropIndex, 0, mvitem[i]);
            }

            for(let i=this.state.tests.length - 1; i>=0; i--) {
                if (this.state.tests[i].test === '!@!@!') {
                    this.state.tests.splice(i, 1);
                }
            }

            this.setState({tests:this.state.tests, rowSelected:null});
        }
    }

    onSelectCopy = () => {
        if (this.state.rowSelected == null || this.state.rowSelected.length <= 0) return;

        let mvid = [];
        let mvitem = [];

        this.state.rowSelected.map((item) => {
            mvid.push(item.id);
        });

        let idx = this.state.tests.length;

        this.state.tests.map((item) => {
            if (mvid.indexOf(item.id) >= 0) {
                mvitem.push({id:idx++, test:String(item.test)});
            }
        });

        mvitem.map((item) => {
           this.state.tests.push(item);
        });

        this.setState({tests:this.state.tests});
    }

    /*onSelectEdit = () => {
        if (this.state.rowSelected == null || this.state.rowSelected.length <= 0) {
            alert('수정할 항목을 선택하세요.');
            return;
        }

        if (this.state.rowSelected.length > 1) {
            alert('하나의 항목만 선택하세요.');
            return;
        }


    }*/

    onSelectDelete = () => {
        if (this.state.rowSelected == null || this.state.rowSelected.length <= 0) return;

        let mvid = [];
        let mvitem = [];

        this.state.rowSelected.map((item) => {
            for(let i=this.state.tests.length - 1; i>=0; i--) {
                if (this.state.tests[i].id == item.id) {
                    this.state.tests.splice(i, 1);
                    break;
                }
            }
        });

        this.setState({tests:this.state.tests});
    }

    testEditor = (props) => {
        return <InputText style={{width:"100%"}} type="text" value={props.rowData['test']} onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
    }

    onEditorValueChange = (props, value) => {
        this.state.tests[props.rowIndex].test = value;
        this.setState({tests:this.state.tests});
    }
    
    render() {
        //const rtc = this.props.route.params.RtcConnect;
        return (
            <>
                <ExcuteTest
                    ref={this.excuteTestRef}
                    show={this.state.showTest}
                    unload={this.testUnload}
                ></ExcuteTest>
                <DeviceSpecPopup 
                    ref={this.dvcPopRef}
                    show={this.state.showFiles} load={true} onLoad={this.onLoad}
                    ></DeviceSpecPopup>
                <TestSpecListPopup 
                    ref={this.testListRef}
                    show={this.state.showTestFiles} onLoad={this.onTestLoad}
                    ></TestSpecListPopup>
                <TestSpecPopup
                    ref={this.testPopRef}
                    show={this.state.showCreate} onCreate={this.onCreate}></TestSpecPopup>
                <Container fluid style={{margin:"10px"}}>
                    <Row style={{margin:"10px"}}>
                        <Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"200px"}}
                                onClick={this.onShowFiles}>장비 규격 파일 불러오기</Button>
                        </Col>
                        <Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"200px"}}
                                onClick={this.onShowTestFiles}>시험 파일 불러오기</Button>
                        </Col>
                        <Col>
                            {this.state.loadFile}
                        </Col>
                    </Row>
                    <Row>
                        <TestSpec
                            ref={this.testRef} onCreate={this.onCreate}
                        ></TestSpec>
                    </Row>
                    <Row style={{margin:"10px"}}>
                        <Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"200px"}}
                                onClick={this.onCreateTest}>예외요청 생성</Button>
                        </Col>
                        <Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"200px"}}
                                    onClick={this.onSelectCopy}>선택항목 복사</Button>
                        </Col>
                        {/*<Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"200px"}}
                                    onClick={this.onSelectEdit}>선택항목 수정</Button>
                        </Col>*/}
                        <Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"200px"}}
                                    onClick={this.onSelectDelete}>선택항목 삭제</Button>
                        </Col>
                    </Row>
                    <Row>
                        <div className="grid">
                            <DataTable value={this.state.tests} editMode="cell" className="p-datatable-sm editable-cells-table"
                                       onRowReorder={this.onRowReorder}
                                       selectionMode="multiple" dataKey="id" selection={this.state.rowSelected} onSelectionChange={e => this.setState({rowSelected:e.value})}>
                                <Column rowReorder style={{width:'3em'}}></Column>
                                <Column key='id' columnKey='test' field='test' editor={(props) => this.testEditor(props)}></Column>
                            </DataTable>
                            {/*this.state.tests.map((test, idx) => (
                                <div className="testitem" key={idx}>
                                    <p>{test}</p>
                                </div>
                            ))*/}
                        </div>
                    </Row>
                    <Row style={{marginTop:"10px"}}>
                        <Col xs="auto" style={{width:"130px"}}>
                            시험파일 이름
                        </Col>
                        <Col xs="auto">
                            <input style={{width:"400px"}} id="testSpecNameInput"></input>
                        </Col>
                        <Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"100px"}}
                            onClick={this.saveClick}>저장</Button>
                        </Col>
                        <Col xs="auto">
                            <Button variant="secondary" size="sm" style={{width:"100px"}}
                                    onClick={this.testClick}>장비 시험</Button>
                        </Col>
                    </Row>
                </Container>
                {this.state.saveAlert && 
                <div style={{position:"absolute", bottom:"50px", left:"10px", opacity:"0.95"}}>
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