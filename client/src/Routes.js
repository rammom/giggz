import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

// Pages
import PageNotFound from './pages/PageNotFound';
import Home from './pages/Home';

class Routes extends Component {
	render() {
		return (
			<React.Fragment>
				<Switch>

					<Route exact path='/home' component={Home} />
					<Route exact path='/'>
						<Redirect to='/home' />
					</Route>



					<Route component={PageNotFound}/>

				</Switch>
			</React.Fragment>
		);
	}
}

export default Routes;
