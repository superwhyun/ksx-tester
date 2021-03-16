import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
//import * as Data from './data';
import CommSpec from './CommSpec'
import './CommSpecComponent.css'

var placeholder = document.createElement("li");
placeholder.className = "itemM";

var key = 0;

export default class CommSpecComponebt extends Component {
    state = {
        readStartingRegister:"",
        writeStartingRegister:"",
        readItems:null,
        writeItems:null,
        savedCommSpec:null,
        refresh:1
    }

    constructor(props) {
        super(props);
        this.commSpec = null;
        this.result = null;
    }

    componentDidMount() {
        this.updateCommSpec();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.cls !== this.props.cls || prevProps.type !== this.props.type || prevProps.subtype !== this.props.subtype) {
            this.updateCommSpec();
        }
    }

    updateCommSpec = () => {
        this.commSpec = CommSpec.getCommSpec(this.props.cls, this.props.type, this.props.subtype);
        if (this.commSpec) {
            this.setState(
                {
                    readStartingRegister:this.commSpec.read["starting-register"] || "",
                    writeStartingRegister:this.commSpec.write ? this.commSpec.write["starting-register"] || "" : "",
                    readItems:this.commSpec.read.items,
                    writeItems:this.commSpec.write ? this.commSpec.write.items : null,
                }
            , () => {
                if (this.state.savedCommSpec) {
                    this.matchCommSpec(this.state.savedCommSpec);
                }
                this.props.onChanged();
            });
        } else { 
            this.setState(
                {
                    readStartingRegister:"",
                    writeStartingRegister:"",
                    readItems:null,
                    writeItems:null,
                }
            , () => {
                this.props.onChanged();
            });
        }
    }

    getCommSpec = () => {
        
        if (!this.commSpec) return null;

        var read = [];
        var write = [];

        if (this.state.readItems === null) return null;

        this.state.readItems.map((item) => {
            if (item.mo !== "x") {
                read.push(item.item);
            }

            return null;
        });

        if (this.state.readStartingRegister != null && this.state.readStartingRegister > 0) {
            this.commSpec.read["starting-register"] = this.state.readStartingRegister;
        } else {
            this.commSpec.read["starting-register"] = undefined;
            delete this.commSpec.read["starting-register"];
        }

        if (this.state.writeItems) {
            this.state.writeItems.map((item) => {
                if (item.mo !== "x") {
                    write.push(item.item);
                }

                return null;
            });
        }

        this.commSpec.read.items = read;

        if (this.commSpec.write) {
            this.commSpec.write.items = write;
            if (this.state.writeStartingRegister != null && this.state.writeStartingRegister > 0) {
                this.commSpec.write["starting-register"] = this.state.writeStartingRegister;
            } else {
                this.commSpec.write["starting-register"] = undefined;
                delete this.commSpec.write["starting-register"];
            }
        }

        return CommSpec.addOuter(this.commSpec);
    }

    setCommSpec = (cmspc) => {
        this.setState({savedCommSpec:cmspc});
    }

    matchCommSpec = (cmspc) => {
        if (!cmspc) return;

        var read = cmspc["KS-X-3267:2021"].read;
        var write = cmspc["KS-X-3267:2021"].write;

        var readitem = null;
        var writeitem = null;

        if (read) {
            this.setState({readStartingRegister:read["starting-register"]});

            readitem = [];
            if (this.state.readItems) {
                read.items.map((item) => {
                    var idx = -1;

                    for(var i = 0; i < this.state.readItems.length; i++) {
                        var it = this.state.readItems[i];
                        if (it.item === item) {
                            idx = i;
                            break;
                        }
                    }

                    if (idx >= 0) {
                        readitem.push(this.state.readItems[idx]);
                    }

                    return null;
                });

                this.state.readItems.map((item) => {
                    if (read.items.indexOf(item.item) < 0) {
                        if (item.mo === "o") {
                            item.mo = "x";
                            readitem.push(item);
                        }
                    }

                    return null;
                });
            }
        }

        if (write) {
            this.setState({writeStartingRegister:write["starting-register"]});
            
            writeitem = [];
            if (this.state.writeItems) {
                write.items.map((item) => {
                    var idx = -1;

                    for(var i = 0; i < this.state.writeItems.length; i++) {
                        var it = this.state.writeItems[i];
                        if (it.item === item) {
                            idx = i;
                            break;
                        }
                    }

                    if (idx >= 0) {
                        writeitem.push(this.state.writeItems[idx]);
                    }

                    return null;
                });

                this.state.writeItems.map((item) => {
                    if (write.items.indexOf(item.item) < 0) {
                        if (item.mo === "o") {
                            item.mo = "x";
                            writeitem.push(item);
                        }
                    }

                    return null;
                });
            }
        }

        this.setState({readItems:readitem, writeItems:writeitem}, () => {
            this.props.onChanged();
        });
    }

    readStartingVal = (val) => {
        if (val.target.value == null || val.target.value.length <= 0) {
            this.setState({readStartingRegister:null}, () => {
                this.props.onChanged();
            });
        } else {
            var parsed = parseInt(val.target.value);
            if (parsed) {
                //this.commSpec.read["starting-register"] = parsed;
                this.setState({readStartingRegister:parsed}, () => {
                    this.props.onChanged();
                });
            }
        }
    }

    writeStartingVal = (val) => {
        if (val.target.value == null || val.target.value.length <= 0) {
            this.setState({writeStartingRegister:null}, () => {
                this.props.onChanged();
            });
        } else {
            var parsed = parseInt(val.target.value);
            if (parsed) {
                //this.commSpec.read["starting-register"] = parsed;
                this.setState({writeStartingRegister:parsed}, () => {
                    this.props.onChanged();
                });
            }
        }
    }

    optionBtn = (type, item) => {
        /*if (type === "read") {
            var idx = this.commSpec.read.items.indexOf(item);
            this.commSpec.read.items[idx].mo = "m";
        }*/

        if (item.mo === "o") item.mo = "x"
        else item.mo = "o"

        this.setState({refresh:1});

        this.props.onChanged();
    }

    dragStart = (e) => {
        this.dragged = e.currentTarget;
        this.dragged.style.backgroundColor = "darkgray";

        e.currentTarget.parentNode.appendChild(placeholder);
    }

    dragOver = (e) => {
        e.preventDefault();
        if (e.target === this.dragged) return;
        if (e.target.tagName !== "LI") return;
        if (e.target.parentNode !== this.dragged.parentNode) return;

        this.over = e.target;

        e.target.parentNode.insertBefore(this.dragged, e.target);
    }

    readDragEnd = (e) => {
        this.dragEnd(this.state.readItems);
        this.setState({readItems:this.state.readItems}, () => {
            this.props.onChanged();
        });
    }

    writeDragEnd = (e) => {
        this.dragEnd(this.state.writeItems);
        this.setState({writeItems:this.state.writeItems}, () => {
            this.props.onChanged();
        });
    }

    dragEnd = (items) => {
        
        this.dragged.style.backgroundColor = null;
        this.dragged.parentNode.removeChild(placeholder);

        if (this.over.dataset.id) {
            var from = Number(this.dragged.dataset.id);
            var to = Number(this.over.dataset.id);
            
            if(from < to) to--;
            
            items.splice(to, 0, items.splice(from, 1)[0]);
        } else {
            var item = items[this.dragged.dataset.id];
            items.splice(this.dragged.dataset.id, 1);
            items.push(item);
        }
    }

    render() {

        

        return (
            <>
            {this.commSpec &&
                <div style={{marginLeft:"15px"}}>
                    <p>CommSpec</p>
                    <div style={{marginLeft:"15px"}}>
                        <p>read</p>
                        <div style={{marginLeft:"15px"}}>
                            starting-register
                            <input style={{marginLeft:"10px"}} id="read-starting-register" onChange={this.readStartingVal} value={this.state.readStartingRegister || ''}></input>
                            {this.state.readItems &&
                            <ul className="list" onDragOver={this.dragOver}>
                                {this.state.readItems.map((item, i) => {
                                    return (
                                        <li className={item.mo === "m" ? "itemM" : (item.mo === "o" ? "itemO" : "itemX")} key={key++}
                                            data-id={i}
                                            draggable="true"
                                            onDragStart={this.dragStart}
                                            onDragEnd={this.readDragEnd}>
                                            {item.item}
                                            {item.mo !== "m" &&
                                                //<Button style={{float:"right"}} size="sm" variant="danger" onClick={()=> this.optionBtn("read", item)}>X</Button>
                                                <Button style={{float:"right",margin:"-3px"}} size="sm" variant={item.mo === "o" ? "danger" : "success"} onClick={()=> {
                                                    this.optionBtn("read", item)
                                                }}>{item.mo === "o" ? "X" : "O"}</Button>
                                            }
                                        </li>
                                    )
                                })}
                            </ul>}
                        </div>
                    </div>
                    {this.state.writeItems && 
                    <div style={{marginLeft:"15px"}}>
                        <p>write</p>
                        <div style={{marginLeft:"15px"}}>
                            starting-register
                            <input style={{marginLeft:"10px"}} id="write-starting-register" onChange={this.writeStartingVal} value={this.state.writeStartingRegister || ''}></input>
                            <ul className="list" onDragOver={this.dragOver}>
                                {this.state.writeItems.map((item, i) => {
                                    return (
                                        <li className={item.mo === "m" ? "itemM" : (item.mo === "o" ? "itemO" : "itemX")} key={key++}
                                            data-id={i}
                                            draggable="true"
                                            onDragStart={this.dragStart}
                                            onDragEnd={this.writeDragEnd}>
                                            {item.item}
                                            {item.mo !== "m" &&
                                                //<Button style={{float:"right"}} size="sm" variant="danger" onClick={()=> this.optionBtn("read", item)}>X</Button>
                                                <Button style={{float:"right",margin:"-3px"}} size="sm" variant={item.mo === "o" ? "danger" : "success"} onClick={()=> {
                                                    this.optionBtn("write", item)
                                                }}>{item.mo === "o" ? "X" : "O"}</Button>
                                            }
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>}
                </div>
            }
            </>
        );
    }
}