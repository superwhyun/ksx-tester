import React, { Component } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import NewWindow from 'react-new-window'

export default class TestSpecListPopup extends Component {
    state = {
        files : null,
        selectFile : null,
        fileData : null,
        addDeviceMessage : null,
    }
/*
    constructor(props) {
        super(props);
    }
*/
    componentDidMount() {
        this.getFiles();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show && this.props.show) {
            this.getFiles();
        }
    }

    getFiles = () => {

        fetch("/testspeclist", {
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
                    this.setState({files:result.files, selectFile : null, fileData : null});
                }
            },
            (error) => {
                alert("파일 검색 실패! " + error);
            }
        )
    }

    onListSelect = (file) =>{
        this.setState({selectFile:file});

        fetch("/testspec?file=" + file, {
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
                    this.setState({fileData:result.data});
                }
            },
            (error) => {
                alert("파일 검색 실패! " + error);
            }
        )
    }

    onLoad = () => {
        if (this.state.selectFile == null || this.state.fileData == null) {
            this.setState({addDeviceMessage:"불러올 장비 규격 파일을 선택하세요."});
            return;
        }

        this.props.onLoad(this.state.fileData, this.state.selectFile);
    }

    onFilesUnload = () => {
        this.setState({files:null, selectFile:null, fileData:null});
    }

    onRemoveFile = () =>{
        
        if (this.state.selectFile == null) {
            this.setState({addDeviceMessage:"삭제할 시험파일을 선택하세요."});
            return;
        }

        fetch("/testspec?file=" + this.state.selectFile, {
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

    render() {
        //const rtc = this.props.route.params.RtcConnect;
        return (
            <>
                {this.props.show &&
                <NewWindow onUnload={this.onFilesUnload} center={"parent"} title={"시험파일 불러오기"} features={{width:1000, height:800}}>
                    <div >
                    <Container fluid style={{margin:"10px"}}>
                        <Row style={{marginLeft:"10px", marginBottom:"10px"}}>
                            <Col></Col>
                            <Col xs="auto">
                                <Button variant="secondary" size="sm" style={{width:"100px"}}
                                    onClick={this.getFiles}>새로고침</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                { this.state.files && this.state.files.length > 0 ?
                                    <div className="heightPopup">
                                        {this.state.files.map((file, idx) => 
                                        <div key={idx}><Button key={idx + "dvcspc"} variant={this.state.selectFile === file ? "primary" : "outline-secondary"} style={{minWidth:"200px", textAlign:"start", marginBottom:"1px"}} onClick={() => this.onListSelect(file)} >{file}</Button><br/></div>
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
                                        {this.state.fileData && this.state.fileData}
                                    </code>
                                </pre>
                            </Col>
                        </Row>
                        
                        <Row style={{marginTop:"10px"}}>
                            <Col></Col>
                            <Col xs="auto">
                                <Button variant="secondary" size="sm" style={{width:"100px", marginRight:"10px"}}
                                onClick={this.onLoad}>불러오기</Button>
                                <Button variant="secondary" size="sm" style={{width:"100px"}}
                                onClick={this.onRemoveFile}>삭제</Button>
                            </Col>
                        </Row>
                    </Container>
                    { this.state.addDeviceMessage && 
                        <div style={{position:"absolute", bottom:"40px", right:"10px", opacity:"0.95"}}>
                        <Alert variant="danger" onClose={() => this.setState({addDeviceMessage:null})} dismissible>
                            {this.state.addDeviceMessage}
                        </Alert>
                        </div>
                    }
                    </div>
                </NewWindow>}
            </>
        );
    }
}