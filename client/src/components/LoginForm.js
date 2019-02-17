import React, { Component } from 'react';
import axios from 'axios';

import ErrorFlash from './ErrorFlash';
import SuccessFlash from './SuccessFlash';

export class LoginForm extends Component {

	state = {
		error_message: '',
		success_message: '',
		user: {
			email: '',
			password: ''
		}
	}

	onChange = async (e) => {
		let user = this.state.user;
		user[e.target.name] = e.target.value;
		this.setState({user});
	}

	onSubmit = async (e) => {
		e.preventDefault();
		await axios.post('/auth/login', this.state.user)
			.then(res => {
				this.setState({error_message: ''});
				this.setState({success_message: "Logging in ..."});
				window.location.reload();
			})
			.catch(err => {
				if (err.response && err.response.data === 'Unauthorized'){
					this.setState({error_message: "Invalid email or password"});
				}
			});
	}

	render() {
		return (
			<div>
				<h2>Login</h2>
				<ErrorFlash message={this.state.error_message} />
				<SuccessFlash message={this.state.success_message} />
				<form onSubmit={this.onSubmit}>
					<div className="form-group">
						<label> Email </label>
						<input type="email" name="email" value={this.state.user.email} className="form-control" onChange={this.onChange} />
					</div>
					<div className="form-group">
						<label> Password </label>
						<input type="password" name="password" value={this.state.user.password} className="form-control" onChange={this.onChange} />
					</div>
					<button type="submit" className="btn btn-sm btn-primary"> Login </button>
				</form>
			</div>
		)
	}
}

export default LoginForm
