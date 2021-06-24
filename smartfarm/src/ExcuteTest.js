import React, { Component } from 'react';
import NewWindow from 'react-new-window'
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import {InputSwitch} from 'primereact/inputswitch';
import './ExcuteTest.css';

export default class ExcuteTest extends Component {
    state = {
        deviceList : [],
        selectDevice : null,
        slaveList : [],
        selectSlave : null,
        invalidDevice : false,
        imageURL : null,
        imageURLDetail : null,
        isLoading : false,
        errorMsg : null,
        detail : false
    }

    deviceSpec = null;
    testSpec = null;

    componentDidMount() {
        let sl = [];
        for(let i=1; i <= 247; i++ ) {
            sl.push(i);
        }

        this.setState({slaveList:sl, selectSlave:1});
    }

    setSpec = (device, test) => {
        //console.log(device);
        //console.log(test);

        this.deviceSpec = device;
        this.testSpec = test;

        this.setState({imageURL:null, imageURLDetail:null, isLoading:false, errorMsg:null});

        this.getSerialport();
    }

    getSerialport = () => {
        fetch("/serialport", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET'
        }).then(res => res.json())
        .then(
            (result) => {
                if (result.result !== "success") {
                    alert("장비 검색 실패! " + result.errormsg);
                } else {
                    //console.log(result.ports);
                    this.setState({deviceList:result.ports}, () => {
                        if (this.state.deviceList.length > 0) {
                            this.setState({selectDevice:this.state.deviceList[0]})
                        }
                    });
                }
            },
            (error) => {
                alert("장비 검색 실패! " + error);
            }
        )
    }

    onChangeDevice = (e) => {
        this.setState({selectDevice:e.value, invalidDevice:false});
    }

    onChangeSlave = (e) => {
        this.setState({selectSlave:e.value});
    }

    onUnload = () => {
        this.props.unload();

        this.setState({selectDevice:null, invalidDevice:false, imageURL:null, isLoading:false,errorMsg:null});
    }

    startTest = () => {
        if (this.state.selectDevice == null) {
            this.setState({invalidDevice:true});
            return;
        }

        this.setState({isLoading:true,imageURL:null,errorMsg:null});

        fetch("/serialport", {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: this.state.selectDevice,
                device: this.deviceSpec,
                test: this.testSpec,
                slave: this.state.selectSlave
            }),
            method: 'POST'
        }).then(res => res.json())
        .then(
            (result) => {
                this.setState({isLoading:false});
                if (result.result !== "success") {
                    console.log(result);
                    this.setState({errorMsg:result.errormsg})
                } else {
                    this.setState({imageURL:result.url, imageURLDetail:result.urldetail});
                }
            },
            (error) => {
                this.setState({isLoading:false, errorMsg:error});
            }
        )
    }

    render(){
        return (
            <>
                { this.props.show &&
                <NewWindow onUnload={this.onUnload} center={"parent"} title={"장비 시험"} features={{width:800, height:800}} style={{fontSize:"12px"}}>
                    <>
                        <div className="p-grid" style={{margin:"20px 10px 10px 10px",fontSize:"12px"}}>
                            <div className="p-col">
                                <div className="p-field p-fluid">
                                    <span className="p-float-label">
                                        <Dropdown className={this.state.invalidDevice ? "p-invalid p-mr-2" : null} value={this.state.selectDevice} options={this.state.deviceList} onChange={this.onChangeDevice}></Dropdown>
                                        <label htmlFor="dropdown">장비 선택</label>
                                    </span>
                                    {
                                        this.state.invalidDevice &&
                                        <small id="username-help" className="p-invalid">장비를 선택해야 합니다.</small>
                                    }
                                </div>
                            </div>
                            <div className="p-col">
                                <span className="p-float-label">
                                    <Dropdown value={this.state.selectSlave} options={this.state.slaveList} onChange={this.onChangeSlave}></Dropdown>
                                    <label htmlFor="dropdown">Slave</label>
                                </span>
                            </div>
                            <div className="p-col">
                                <Button className="p-button-secondary" label="시험 시작" onClick={this.startTest}></Button>
                            </div>
                        </div>
                        <div className="p-grid" style={{margin:"0px 10px 10px 20px"}}>
                            <h6 style={{marginRight:"10px"}}>상세보기</h6>
                            <InputSwitch checked={this.state.detail} onChange={(e) => this.setState({detail:e.value})}/>
                        </div>
                        <div className="p-grid p-justify-center result-area">
                            <div className="p-col-align-center">
                                {this.state.isLoading &&
                                    <ProgressSpinner/>}
                                { (this.state.detail && this.state.imageURLDetail ) &&
                                        <img alt="이미지 불러오기 실패!" src={this.state.imageURLDetail}/>}
                                { (!this.state.detail && this.state.imageURL ) &&
                                    <img alt="이미지 불러오기 실패!" src={this.state.imageURL}/>}
                                {this.state.errorMsg &&
                                    <h3>시험 실패!<br/>{this.state.errorMsg}</h3>
                                }
                            </div>
                        </div>
                    </>
                </NewWindow>
                }
            </>
        );
    }
}
