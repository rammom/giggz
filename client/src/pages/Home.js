import React, { Component } from 'react';
import '../style.css';

import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export class Home extends Component {

	render() {
		return (
			<React.Fragment>
				<h1>Giggs</h1>
				<div className="row">
					<div className="col-sm-12 col-md bdr">
						<LoginForm authenticate={this.props.authenticate}/>
					</div>
					<div className="col-sm-12 col-md bdr">
						<RegisterForm />
					</div>
				</div>
			</React.Fragment>
		)
	}
}

export default Home;
