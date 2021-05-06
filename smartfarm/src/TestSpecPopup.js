import React, { Component } from 'react';
import NewWindow from 'react-new-window'
import TestSpec from './TestSpec'


export default class TestSpecPopup extends Component {
    state = {
        deviceSpec:null,

    }

    constructor(props) {
        super(props);
        this.testRef = React.createRef();
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps) {
        
    }

    setDeviceSpec = (deviceSpec) => {
        this.setState({deviceSpec:deviceSpec});
    }

    onCreate = (json) => {
        
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

    /*onMount = () => {
        if (this.state.deviceSpec && this.testRef.current) {
            this.testRef.current.setDeviceSpec(this.state.deviceSpec, true);
        }
    }*/

    render() {
        //const rtc = this.props.route.params.RtcConnect;
        return (
            <>
                {this.props.show &&
                <NewWindow onUnload={this.onUnload} center={"parent"} title={"예외요청 추가"} features={{width:800, height:250}}>
                    <div>
                        <TestSpec
                            ref={this.testRef} onCreate={this.onCreate} deviceSpec={this.state.deviceSpec}
                            ></TestSpec>
                    </div>
                </NewWindow>}
            </>
        );
    }
}