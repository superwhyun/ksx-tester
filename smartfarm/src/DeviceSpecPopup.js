import React, { Component } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import NewWindow from 'react-new-window';
import { saveAs } from 'file-saver';
import { FileUpload } from 'primereact/fileupload';

export default class DeviceSpecPopup extends Component {
    state = {
        files : null,
        selectFile : null,
        fileJson : null,
        addDeviceMessage : null,
        errorMsg : true,
        class : null,
        canModify : false,
        canLoad : false,
    }
/*
    constructor(props) {
        super(props);
    }
*/
    componentDidMount() {
        this.getFiles();
        this.setState({canModify:this.props.modify, canLoad:this.props.load});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show && this.props.show) {
            this.getFiles();
        }
    }

    setClass = (cls) => {
        this.setState({class:cls});
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
                    this.setState({files:result.files, selectFile : null, fileJson : null});
                }
            },
            (error) => {
                alert("파일 검색 실패! " + error);
            }
        );
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
                window.alert("파일 검색 실패! " + error);
            }
        )
    }

    onFilesUnload = () => {
        this.setState({files:null, selectFile:null, fileJson:null});
    }

    onAddDevice = () => {

        if (this.state.selectFile == null || this.state.fileJson == null) {
            this.setState({addDeviceMessage:"추가할 장비 규격 파일을 선택하세요."});
            return;
        }

        this.props.onAddDevice(this.state.selectFile, this.state.fileJson);

        //this.state.addDeviceList[this.state.selectFile] = this.state.fileJson;
        //this.setState({addDeviceList:this.state.addDeviceList});
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
                    this.getFiles();
                }
            },
            (error) => {
                alert("파일 삭제 실패! " + error);
            }
        )
    }

    onModify = () => {
        if (this.state.selectFile == null || this.state.fileJson == null) {
            this.setState({addDeviceMessage:"수정할 장비 규격 파일을 선택하세요."});
            return;
        }

        this.props.onModify(this.state.fileJson, this.state.selectFile);

        //this.setJson(this.state.fileJson);
        //document.getElementById('deviceSpecNameInput').value = this.state.selectFile;
    }

    onLoad = () => {
        if (this.state.selectFile == null || this.state.fileJson == null) {
            this.setState({addDeviceMessage:"불러올 장비 규격 파일을 선택하세요."});
            return;
        }

        this.props.onLoad(this.state.fileJson, this.state.selectFile);
    }

    onDownload = () => {
        if (!this.state.fileJson || this.state.fileJson.length < 0) {
            this.setState({addDeviceMessage:"다운로드할 장비 규격 파일을 선택하세요."});
            console.log(this.state.errorMsg);
            return;
        }

        let blob = new Blob([JSON.stringify(this.state.fileJson, null, 4)], {type:'text/plain;charset=utf-8'});
        saveAs(blob, this.state.selectFile);
    }

    onUpload = () => {
        this.setState({errorMsg:false}, () => {
            console.log(this.state.errorMsg);
            this.setState({errorMsg:false,addDeviceMessage:"업로드 성공!"}, () => {
                console.log(this.state.errorMsg);
                this.getFiles();
                this.setState({errorMsg:true});
            });
        });
    }

    render() {
        //const rtc = this.props.route.params.RtcConnect;
        return (
            <>
                {this.props.show &&
                <NewWindow onUnload={this.onFilesUnload} center={"parent"} title={"장비 규격 파일 불러오기"} features={{width:800, height:800}}>
                    <div >
                    <Container fluid style={{margin:"10px"}}>
                        <Row style={{marginLeft:"10px", marginBottom:"10px"}}>
                            <Col></Col>
                            <Col xs="auto">
                                <Button variant="secondary" size="sm" style={{width:"100px"}}
                                    onClick={this.getFiles}>새로고침</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                { this.state.files && this.state.files.length > 0 ?
                                    <div className="heightPopup">
                                        {this.state.files.map((file, idx) => 
                                        <div key={idx}><Button key={idx + "dvcspc"} variant={this.state.selectFile === file ? "primary" : "outline-secondary"} style={{minWidth:"300px", textAlign:"start", marginBottom:"1px"}} onClick={() => this.onListSelect(file)} >{file}</Button><br/></div>
                                        )}
                                    </div>
                                    
                                /*<ListGroup onSelect={this.onListSelect}>
                                    {this.state.files.map(file => 
                                        <ListGroup.Item key={itemKey++} eventKey={file} action >{file}</ListGroup.Item>
                                        )}
                                </ListGroup>*/ : <div>저장된 파일 없음</div> }

                                
                            </Col>
                        
                            <Col style={{borderLeft:"5px solid gray"}}>
                                <pre className="heightPopup">
                                    <code>
                                        {this.state.fileJson && JSON.stringify(this.state.fileJson, null, 4)}
                                    </code>
                                </pre>
                            </Col>
                        </Row>
                        
                        <Row style={{marginTop:"10px"}}>
                            <Col></Col>
                            <Col xs="auto">
                                { this.state.class === "node" && 
                                <Button variant="secondary" size="sm" style={{width:"120px", marginRight:"10px"}}
                                onClick={this.onAddDevice}>Device로 추가</Button> }
                                { this.state.canModify &&
                                <Button variant="secondary" size="sm" style={{width:"100px", marginRight:"10px"}}
                                onClick={this.onModify}>수정</Button>}
                                { this.state.canLoad &&
                                <Button variant="secondary" size="sm" style={{width:"100px", marginRight:"10px"}}
                                onClick={this.onLoad}>불러오기</Button>}
                                <Button variant="secondary" size="sm" style={{width:"100px", marginRight:"10px"}}
                                onClick={this.onDownload}>다운로드</Button>
                                <Button variant="secondary" size="sm" style={{width:"100px"}}
                                onClick={this.onRemoveFile}>삭제</Button>
                            </Col>
                        </Row>
                    </Container>
                    { this.state.addDeviceMessage && 
                        <div style={{position:"absolute", bottom:"40px", right:"10px", opacity:"0.95"}}>
                        <Alert variant={this.state.errorMsg === false ? "success" : "danger" } onClose={() => this.setState({addDeviceMessage:null})} dismissible>
                            {this.state.addDeviceMessage}
                        </Alert>
                        </div>
                    }
                    <div style={{position:'absolute', bottom:"10px", left:"10px"}}>
                        <FileUpload style={{height:"31px !important",backgroundColor:'#dddddd  !important'}} mode="basic" name="file" url="/devicespec" accept=".json" maxFileSize={1000000} onUpload={this.onUpload} auto chooseLabel="업로드" multiple/>
                    </div>
                    </div>
                </NewWindow>}
            </>
        );
    }
}