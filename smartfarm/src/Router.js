import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom'
import EquipManage from './EquipManage'
import SequenceManage from './SequenceManage'


export default class Router extends Component {
    
    render() {
        //const rtc = this.props.route.params.RtcConnect;
        return (
            
                <>
                    <Switch>
                        <Route path="/equip" exact component={EquipManage}/>
                        <Route path="/sequence" exact component={SequenceManage}/>
                        <Redirect from="*" to="/equip" />
                    </Switch>
                </>
        );
    }
}