import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';

// Pages
import PageNotFound from './pages/PageNotFound';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';

class Routes extends Component {

	state = {
		authenticated: false,
		user: {}
	}

	componentDidMount() {
		axios.get('/api/user')
			.then(res => {
				this.setState({ user: res.data.user });
				this.setState({ authenticated: true });
			})
			.catch(err => {
				this.setState({ authenticated: false });
				console.log(err);
			});
	}

	MyRoute = ({ component: Component, ...rest }) => {
		return (
			<Route {...rest} render={(props) => (
				(this.state.authenticated)
				? <Redirect to="/dashboard" />
				: <Component {...props} />
			)} />
		);
	}

	PrivateRoute = ({ component: Component, ...rest }) => {
		return (
			<Route {...rest} render={(props) => (
				(this.state.authenticated) 
				? <Component user={this.state.user} {...props} />
				: <Redirect to="/home" />
			)} />
		);
	}

	authenticate = () => {
		this.setState({authenticated: true});
	}

	render() {
		return (
			<React.Fragment>
				<Switch>

					<this.MyRoute exact path='/home' component={Home} />
					<Route exact path='/'>
						<Redirect to='/home' />
					</Route>

					<this.PrivateRoute exact path='/dashboard' component={UserDashboard} />

					<Route component={PageNotFound} />

				</Switch>
			</React.Fragment>
		);
	}
}

export default Routes;
