import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap'

//export default withRouter(({ location : {pathname}} ) => (
    export default () => (
    /*<header className="nav" style={{backgroundColor:'#353535'}}>
        <ul>
            <div className="navheader">
                <li>
                    <a href="/">ETRI SmartFarm</a>
                </li>
            </div>
            <div className={pathname === "/equip" ? "navcurrent" : "nav" }>
                <li>
                    <a href="/equip">장비 규격 관리</a>
                </li>
            </div>
            <div className={pathname === "/sequence" ? "navcurrent" : "nav" }>
                <li>
                    <a href="/sequence">시험 규격 관리</a>
                </li>
            </div>
        </ul>
    </header>*/
    <Navbar bg="dark" expand="lg" variant="dark">
        <Navbar.Brand href="/equip">ETRI SmartFarm</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
            <Nav.Link as={Link} to="/equip">장비 규격 관리</Nav.Link>
            <Nav.Link as={Link} to="/sequence">시험 규격 관리</Nav.Link>
            </Nav>
        </Navbar.Collapse>
    </Navbar>
    /*<div>
        <TabMenu model={items}/>
    </div>*/
);