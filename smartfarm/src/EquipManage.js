import React, { Component } from 'react';
import { Button } from 'primereact/button';
import * as Data from './data'
import CommSpecComponent from './CommSpecComponent'
import DeviceSpecPopup from './DeviceSpecPopup'
import { Toast } from 'primereact/toast';
import { confirmPopup } from 'primereact/confirmpopup';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { Panel } from 'primereact/panel';

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
        this.setState({showFiles:false});
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
                return dvc;
            });

            this.setState({addDeviceList:dvclist});
        }
    }

    onAddDevice = (name, json) => {
        if (this.state.type === 'sensor-node') {
            if (json.Class !== 'sensor') {
                console.log(json);
                this.toastBL.show({severity:'error', summary: '추가 실패', detail:'sensor-node 에는 sensor만 추가할 수 있습니다.', life: 3000});
                return;
            }
        } else if (this.state.type === 'actuator-node') {
            if (json.Class !== 'actuator') {
                console.log(json);
                this.toastBL.show({severity:'error', summary: '추가 실패', detail:'actuator-node 에는 actuator만 추가할 수 있습니다.', life: 3000});
                return;
            }
        }
        if (this.state.addDeviceList[name]) {
            let idx = 1;
            while(true) {
                if (!this.state.addDeviceList[name+'_'+idx]) {
                    this.state.addDeviceList[name+'_'+idx] = json;
                    break;
                }

                idx++;
            }
        }
        this.state.addDeviceList[name] = json;
        this.setState({addDeviceList:this.state.addDeviceList});
    }

    onRemoveFromDeviceList = (file) => {
        delete this.state.addDeviceList[file];
        this.setState({addDeviceList:this.state.addDeviceList});
    }


    saveClick = (event) => {

        // 문법검사필요
        // starting register 생략 가능 (노드 제외)
        if (!this.state.deviceSpecName) {
            //this.setSaveMsg(false, '장비 규격 이름을 입력하세요.');
            this.toastBL.show({severity:'error', summary: 'Error', detail:'장비 규격 이름을 입력하세요.', life: 3000});
            return;
        }

        let overwriteConfirm = {
            target: event ? event.currentTarget : null,
            message: '동일한 이름의 장비 규격 파일이 있습니다. 덮어쓰시겠습니까?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel:'예',
            rejectLabel:'아니오',
            accept: this.overwriteClick,
            reject: null
        };

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
                    //this.setSaveMsg(false, result.errormsg);
                    this.toastBL.show({severity:'error', summary: '저장 실패', detail:result.errormsg, life: 3000});
                } else if (result.result === "duplicate") {
                    //this.state.overwriteMessage = true;
                    //this.setSaveMsg(false, null);
                    confirmPopup(overwriteConfirm); 
                } else if (result.result === "success") {
                    //this.setSaveMsg(true, result.file);
                    this.toastBL.show({severity:'success', summary: '저장 성공', detail:result.file, life: 3000});
                } else {
                    //this.setSaveMsg(false, result.errormsg);
                    this.toastBL.show({severity:'error', summary: '저장 실패', detail:result.errormsg, life: 3000});
                }
            },
            (error) => {
                //this.setSaveMsg(false, error);
                this.toastBL.show({severity:'error', summary: '저장 실패', detail:error, life: 3000});
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
        return (
            <>
                <DeviceSpecPopup 
                    ref={this.dvcPopRef}
                    show={this.state.showFiles} modify={true}
                    onModify={this.onModify}
                    onAddDevice={this.onAddDevice}></DeviceSpecPopup>
                <div className="p-grid p-justify-between">
                    <div className="p-col-fixed" style={{width:"250px"}}>
                        <Button className="p-button-secondary" label="장비 규격 파일 검색" style={{width:"200px", margin:"10px 10px 10px 20px"}}
                            onClick={this.onShowFiles}></Button>
                    </div>
                    <div className="p-col-fixed" style={{width:"500px", marginTop:"10px", marginRight:"20px"}}>
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon" style={{width:"130px"}}>장비 규격 이름</span>
                            <InputText id="deviceSpecNameInput" onKeyUp={this.setDeviceSpecName} ></InputText>
                            <Button className="p-button-secondary" label="저장" style={{width:"100px"}}
                                onClick={this.saveClick}></Button>
                        </div>
                    </div>
                </div>
                <div className="p-grid">
                    <div className="p-col-fixed" style={{width:"450px",paddingRight:"0px"}}>
                        <Panel header="SPEC" style={{marginLeft:"10px"}}>
                        <div className="heightLine">
                            <span className="p-float-label" style={{marginTop:"20px"}}>
                                <Dropdown style={{width:"225px"}} value={this.state.class} options={Data.deviceClasses} onChange={(e) =>{
                                    if (this.state.class !== e.value) {
                                        this.setState({type:null, subtype:null, valueunit:null, addDeviceList:{}, commSpec:null}, () => {
                                            this.csCmpRef.current.setCommSpec(null);
                                            this.dvcPopRef.current.setClass(this.state.class);
                                        });
                                    }

                                    this.setState({class:e.value});
                                }}></Dropdown>
                                <label htmlFor="dropdown">Class</label>
                            </span>
                            <div className="p-grid" style={{marginTop:"20px"}}>
                                <div className="p-col-fixed" style={{width:"230px"}}>
                                    <span className="p-float-label">
                                        <Dropdown value={this.state.type} options={Data.getDeviceTypes(this.state.class)} onChange={(e) =>{
                                            this.csCmpRef.current.setCommSpec(null);
                                            this.setState({type:e.value, subtype:null, addDeviceList:{}}, () => {
                                                if (this.state.class == 'sensor') {
                                                    this.setState({valueunit:Data.getValueUnit4Type(e.value)});
                                                }
                                            });
                                        }}></Dropdown>
                                        <label htmlFor="dropdown">Type</label>
                                    </span>
                                </div>
                                <div className="p-col">
                                    <span className="p-float-label">
                                        <Dropdown style={{width:"150px"}} value={this.state.subtype} options={Data.getDeviceSubTypes(this.state.type)} onChange={(e) =>{
                                            this.csCmpRef.current.setCommSpec(null);
                                            this.setState({subtype:e.value});
                                        }}></Dropdown>
                                        <label htmlFor="dropdown">SubType</label>
                                    </span>
                                </div>
                            </div>
                            <div className="p-inputgroup" style={{marginTop:"20px",width:"380px"}}>
                                <span className="p-inputgroup-addon" style={{width:"130px"}}>Model</span>
                                <InputText id="modelInput" onKeyUp={this.setModel} placeholder="제품의 모델 번호 (영문과 숫자의 조합)"></InputText>
                            </div>
                            <div className="p-inputgroup" style={{marginTop:"10px",width:"380px"}}>
                                <span className="p-inputgroup-addon" style={{width:"130px"}}>Name</span>
                                <InputText id="nameInput" onKeyUp={this.setName} placeholder="모델명 (문자열)"></InputText>
                            </div>
                            {
                                this.isSensor() && 
                                <div>
                                    <div className="p-inputgroup" style={{marginTop:"10px",width:"380px"}}>
                                        <span className="p-inputgroup-addon" style={{width:"130px"}}>ValueUnit</span>
                                        <Dropdown style={{width:"50px"}} value={this.state.valueunit} options={Data.valueUnit} optionLabel="name" optionValue="value" onChange={(e) =>{
                                            if (e.value === 'etc' && this.state.valueunit !== 'etc') {
                                                this.setState({valueunitetc:null});
                                            }

                                            this.setState({valueunit:e.value});
                                        }}></Dropdown>
                                        {
                                            this.state.valueunit === 'etc' &&
                                            <InputText id="valueUnitInput" onKeyUp={this.setValueUnitEtc} ></InputText>
                                        }
                                    </div>
                                    <div className="p-inputgroup" style={{marginTop:"10px",width:"380px"}}>
                                        <span className="p-inputgroup-addon" style={{width:"130px"}}>SignificantDigit</span>
                                        <Dropdown style={{width:"50px"}} value={this.state.sd} options={Data.sd} onChange={(e) =>{
                                            this.setState({sd:e.value});
                                        }}></Dropdown>
                                    </div>
                                </div>
                            }
                            {
                                this.state.class !== 'node' && 
                                <div className="p-inputgroup" style={{marginTop:"10px",width:"380px"}}>
                                    <span className="p-inputgroup-addon" style={{width:"130px"}}>Channel</span>
                                    <InputText id="channelInput" onKeyUp={this.setChannel} ></InputText>
                                </div>
                            }
                            <div style={{marginTop:"20px", padding:"0px", width:"380px"}}>
                                <CommSpecComponent 
                                    ref={this.csCmpRef} 
                                    cls={this.state.class} type={this.state.type} subtype={this.state.subtype} onChanged={this.onCommSpecChange}>
                                </CommSpecComponent>
                            </div>
                            {
                                this.state.class === 'node' && 
                                <Button className="p-button-secondary" label="Device 추가" style={{width:"130px", height:"30px", marginTop:"20px"}}
                                    onClick={this.onShowFiles}></Button>
                            }
                            {
                                this.state.class === 'node' && Object.keys(this.state.addDeviceList).length > 0 &&
                                <div>
                                    {Object.keys(this.state.addDeviceList).map((key, idx) => (
                                        <div  key={idx} className="p-inputgroup" style={{height:"33px",marginTop:"5px"}}>
                                            <span className="p-inputgroup-addon" style={{width:"345px"}}>{key}</span>
                                            <Button className="p-button-danger" icon="pi pi-times" onClick={()=> this.onRemoveFromDeviceList(key)}/>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                        </Panel>
                    </div>
                    <div className="p-col" style={{}}>
                        <Panel header="JSON" style={{marginRight:"10px"}}>
                            <div className="heightLine" style={{marginBottom:"0px"}}>
                                <pre style={{marginRight:"10px",fontSize:"13px"}}>
                                    
                                        {JSON.stringify(this.getJson(), null, 4)}
                                    
                                </pre>
                            </div>
                        </Panel>
                    </div>
                </div>
                <Toast ref={(el) => this.toastBL = el} position="top-right" />
            </>            
        );
    }
}