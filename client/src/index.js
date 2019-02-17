import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes';
import axios from 'axios';

axios.interceptors.response.use((response) => {
	return response;
}, (err) => {
	// if the err.response.data is equal to "Unauthorized" string the user is trying to login
	if (!window.location.href.includes('/home') && err.response.status === 401){
		window.location.replace('/home');
	}
	return Promise.reject(err);
});

ReactDOM.render(
	<Router>
		<Routes />
	</Router>, 
	document.getElementById('root')
);