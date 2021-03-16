{this.state.showFiles &&
    <NewWindow onUnload={this.onFilesUnload} center={"parent"} title={"장비 규격 파일 검색"} features={{width:800, height:800}}>
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
                        <div class="heightPopup">
                            {this.state.files.map((file, idx) => 
                            <div><Button key={idx} variant={this.state.selectFile === file ? "primary" : "outline-secondary"} style={{minWidth:"300px", textAlign:"start", marginBottom:"1px"}} onClick={() => this.onListSelect(file)} >{file}</Button><br/></div>
                            )}
                        </div>
                        
                    /*<ListGroup onSelect={this.onListSelect}>
                        {this.state.files.map(file => 
                            <ListGroup.Item key={itemKey++} eventKey={file} action >{file}</ListGroup.Item>
                            )}
                    </ListGroup>*/ : <div>저장된 파일 없음</div> }

                    
                </Col>
            
                <Col style={{borderLeft:"5px solid gray"}}>
                    <pre class="heightPopup">
                        <code>
                            {this.state.fileJson && JSON.stringify(this.state.fileJson, null, 4)}
                        </code>
                    </pre>
                </Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs="auto">
                { this.state.addDeviceMessage && 
                    <Alert variant="danger" onClose={() => this.setState({addDeviceMessage:null})} dismissible>
                        {this.state.addDeviceMessage}
                    </Alert>
                }</Col>
            </Row>
            <Row style={{marginTop:"10px"}}>
                <Col></Col>
                <Col xs="auto">
                    { this.state.class === "node" && <Button variant="secondary" size="sm" style={{width:"120px", marginRight:"10px"}}
                    onClick={this.onAddDevice}>Device로 추가</Button> }
                    <Button variant="secondary" size="sm" style={{width:"100px", marginRight:"10px"}}
                    onClick={this.onModify}>수정</Button>
                    <Button variant="secondary" size="sm" style={{width:"100px"}}
                    onClick={this.onRemoveFile}>삭제</Button>
                </Col>
            </Row>
        </Container>
        </div>
    </NewWindow>}