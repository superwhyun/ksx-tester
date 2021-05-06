import React, { Component } from 'react';
import NewWindow from 'react-new-window'
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';

export default class TestSpecListPopup extends Component {
    state = {
        files : null,
        selectFile : null,
        fileData : null
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
            this.toastBL.show({severity:'error', detail:"불러올 장비 규격 파일을 선택하세요.", life: 3000});
            return;
        }

        this.props.onLoad(this.state.fileData, this.state.selectFile);
    }

    onFilesUnload = () => {
        this.setState({files:null, selectFile:null, fileData:null});
    }

    onRemoveFile = () =>{
        
        if (this.state.selectFile == null) {
            this.toastBL.show({severity:'error', detail:"삭제할 시험파일을 선택하세요.", life: 3000});
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
                <NewWindow onUnload={this.onFilesUnload} center={"parent"} title={"시험파일 불러오기"} features={{width:1200, height:800}}>
                    <div >
                        <div className="p-grid p-justify-end">
                            <div className="p-col-2" style={{margin:"5px",marginRight:"10px"}}>
                                <Button className="p-button-secondary" label="새로고침" style={{width:"100%"}}
                                    onClick={this.getFiles}></Button>
                            </div>
                        </div>
                        <div className="p-grid">
                            <div className="p-col-fixed" style={{width:"310px",paddingRight:"0px"}}>
                                <Panel header="FILE" style={{marginLeft:"10px"}}>
                                {
                                    this.state.files && this.state.files.length > 0 ?
                                    <div className="heightPopup">
                                        {this.state.files.map((file, idx) => 
                                        <div key={idx}><Button key={idx + "dvcspc"} className={this.state.selectFile === file ? "p-button-primary" : "p-button-outlined p-button-secondary"} style={{minWidth:"250px", textAlign:"start", marginBottom:"1px"}} label={file} onClick={() => this.onListSelect(file)} ></Button><br/></div>
                                        )}
                                    </div>
                                    :
                                    <div>저장된 파일 없음</div>
                                }
                                </Panel>
                            </div>
                            <div className="p-col">
                                <Panel header="JSON" style={{marginRight:"10px"}}>
                                    <div className="heightPopup" style={{marginBottom:"0px"}}>
                                        <pre style={{fontSize:"13px"}}>
                                            <code>
                                                {this.state.fileData && this.state.fileData}
                                            </code>
                                        </pre>
                                    </div>
                                </Panel>
                            </div>
                        </div>
                        <div className="p-grid p-justify-end" style={{marginRight:"10px"}}>
                            <div className="p-col-2">
                                <Button className="p-button-secondary" label="불러오기" style={{width:"100%"}}
                                    onClick={this.onLoad}></Button>
                            </div>
                            <div className="p-col-2">
                                <Button className="p-button-secondary" label="삭제" style={{width:"100%"}}
                                    onClick={this.onRemoveFile}></Button>
                            </div>
                        </div>
                        <Toast ref={(el) => this.toastBL = el} position="bottom-right" />
                    </div>
                </NewWindow>}
            </>
        );
    }
}