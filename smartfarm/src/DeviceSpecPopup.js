import React, { Component } from 'react';
import NewWindow from 'react-new-window';
import { saveAs } from 'file-saver';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';

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
            //this.setState({addDeviceMessage:"추가할 장비 규격 파일을 선택하세요."});
            this.toastBL.show({severity:'error', detail:"추가할 장비 규격 파일을 선택하세요.", life: 3000});
            return;
        }

        this.props.onAddDevice(this.state.selectFile, this.state.fileJson);

        //this.state.addDeviceList[this.state.selectFile] = this.state.fileJson;
        //this.setState({addDeviceList:this.state.addDeviceList});
    }

    onRemoveFile = () =>{
        
        if (this.state.selectFile == null) {
            //this.setState({addDeviceMessage:"삭제할 장비 규격 파일을 선택하세요."});
            this.toastBL.show({severity:'error', detail:"삭제할 장비 규격 파일을 선택하세요.", life: 3000});
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
            //this.setState({addDeviceMessage:"수정할 장비 규격 파일을 선택하세요."});
            this.toastBL.show({severity:'error', detail:"수정할 장비 규격 파일을 선택하세요.", life: 3000});
            return;
        }

        this.props.onModify(this.state.fileJson, this.state.selectFile);

        //this.setJson(this.state.fileJson);
        //document.getElementById('deviceSpecNameInput').value = this.state.selectFile;
    }

    onLoad = () => {
        if (this.state.selectFile == null || this.state.fileJson == null) {
            //this.setState({addDeviceMessage:"불러올 장비 규격 파일을 선택하세요."});
            this.toastBL.show({severity:'error', detail:"불러올 장비 규격 파일을 선택하세요.", life: 3000});
            return;
        }

        this.props.onLoad(this.state.fileJson, this.state.selectFile);
    }

    onDownload = () => {
        if (!this.state.fileJson || this.state.fileJson.length < 0) {
            //this.setState({addDeviceMessage:"다운로드할 장비 규격 파일을 선택하세요."});
            this.toastBL.show({severity:'error', detail:"다운로드할 장비 규격 파일을 선택하세요.", life: 3000});
            //console.log(this.state.errorMsg);
            return;
        }

        let blob = new Blob([JSON.stringify(this.state.fileJson, null, 4)], {type:'text/plain;charset=utf-8'});
        saveAs(blob, this.state.selectFile);
    }

    onUpload = () => {
        this.setState({errorMsg:false}, () => {
            //console.log(this.state.errorMsg);
            //this.setState({errorMsg:false,addDeviceMessage:"업로드 성공!"}, () => {
            //    console.log(this.state.errorMsg);
            this.toastBL.show({severity:'success', detail:"업로드 성공!", life: 3000});
            this.getFiles();
            //this.setState({errorMsg:true});
            //});
        });
    }

    render() {
        //const rtc = this.props.route.params.RtcConnect;
        return (
            <>
                {this.props.show &&
                <NewWindow onUnload={this.onFilesUnload} center={"parent"} title={"장비 규격 파일 불러오기"} features={{width:800, height:800}}>
                    <div >
                        <div className="p-grid p-justify-end">
                            <div className="p-col-2" style={{margin:"5px",marginRight:"10px"}}>
                                <Button className="p-button-secondary" label="새로고침" style={{width:"100%"}}
                                    onClick={this.getFiles}></Button>
                            </div>
                        </div>
                        <div className="p-grid">
                            <div className="p-col-fixed" style={{width:"340px",paddingRight:"0px"}}>
                                <Panel header="FILE" style={{marginLeft:"10px"}}>
                                {
                                    this.state.files && this.state.files.length > 0 ?
                                    <div className="heightPopup">
                                        {this.state.files.map((file, idx) => 
                                        <div key={idx}><Button key={idx + "dvcspc"} className={this.state.selectFile === file ? "p-button-primary" : "p-button-outlined p-button-secondary"} style={{minWidth:"280px", textAlign:"start", marginBottom:"1px"}} label={file} onClick={() => this.onListSelect(file)} ></Button><br/></div>
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
                                                {this.state.fileJson && JSON.stringify(this.state.fileJson, null, 4)}
                                            </code>
                                        </pre>
                                    </div>
                                </Panel>
                            </div>
                        </div>
                        <div className="p-grid p-justify-between" style={{marginTop:"0px",marginLeft:"10px",marginRight:"15px"}}>
                            <div className="p-col-2" style={{padding:"0px"}}>
                                <FileUpload style={{height:"31px !important",backgroundColor:'#dddddd  !important'}} mode="basic" name="file" url="/devicespec" accept=".json" maxFileSize={1000000} onUpload={this.onUpload} auto chooseLabel="업로드" multiple/>
                            </div>
                            <div className="p-col" style={{padding:"0px"}}>
                                <div className="p-grid p-justify-end">
                                    {
                                        this.state.class === "node" && 
                                        <div className="p-col-3">
                                            <Button className="p-button-secondary" label="Device로 추가" style={{width:"130px"}}
                                                onClick={this.onAddDevice}></Button>
                                        </div>
                                    }
                                    {
                                        this.state.canModify &&
                                        <div className="p-col-2">
                                            <Button className="p-button-secondary" label="수정" style={{width:"100px"}}
                                                onClick={this.onModify}></Button>
                                        </div>
                                    }
                                    {
                                        this.state.canLoad &&
                                        <div className="p-col-2">
                                            <Button className="p-button-secondary" label="불러오기" style={{width:"100px"}}
                                                onClick={this.onLoad}></Button>
                                        </div>
                                    }
                                    <div className="p-col-2">
                                        <Button className="p-button-secondary" label="다운로드" style={{width:"100px"}}
                                            onClick={this.onDownload}></Button>
                                    </div>
                                    <div className="p-col-2">
                                        <Button className="p-button-secondary" label="삭제" style={{width:"100px"}}
                                            onClick={this.onRemoveFile}></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Toast ref={(el) => this.toastBL = el} position="bottom-right" />
                    </div>
                </NewWindow>}
            </>
        );
    }
}