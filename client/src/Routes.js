import React, { Component, useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect, useDispatch, useSelector } from 'react-redux';
import { withRouter } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from './utils/setAuthToken';
import { handleSignOut, handleVerifyUser, fetchUserArtworkList, fetchCartList } from './store/actions/common.actions';

import Loader from './components/Loader';
import ErrorPopup from './components/Error/ErrorPopup';

import Home from './components/Home/Home';
import Explore from './components/Explore/Explore';
import ExploreShow from './components/Explore/ExploreShow';
import About from './components/Help/About';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Account/Profile';
import Notification from './components/Notification/Notification';
import Store from './components/Store/Store';
import StoreShow from './components/Store/StoreShow';
import StoreUpload from './components/Store/StoreUpload';
import Upload from './components/Explore/Upload';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Privacy from './components/Help/Privacy';

const Routes = (props) => {
    useEffect(async () => {
        if (localStorage.jwtToken) {
            const token = localStorage.jwtToken;
            setAuthToken(token);
            const decoded = jwt_decode(token);
            await props.handleVerifyUser(decoded);
            await props.fetchUserArtworkList();
            await props.fetchCartList();
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                props.handleSignOut();
                window.location.href = './';
            }
        }
    }, []);

    return (
        <div>
            <Loader />
            <Header />
            <ErrorPopup />
            <Switch>
                <Route path='/' exact component={Home} />
                <Route path='/about' exact component={About} />
                <Route path='/explore' exact component={Explore} />
                <Route path='/explore/:id' exact component={ExploreShow} />
                <Route path='/dashboard' exact component={Dashboard} />
                <Route path='/notification' exact component={Notification} />
                <Route path='/store' exact component={Store} />
                <Route path='/store/upload' exact component={StoreUpload} />
                <Route path='/store/:id' exact component={StoreShow} />
                <Route path='/upload' exact component={Upload} />
                <Route path='/user/:id' exact component={Profile} />
                <Route path='/privacy' exact component={Privacy} />
            </Switch>
            <Footer />
        </div>

    );
}

const mapStateToProps = (state, props) => ({
    common: state.common
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
    handleVerifyUser,
    fetchUserArtworkList,
    fetchCartList,
    handleSignOut
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Routes));