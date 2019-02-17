import React, { Component } from 'react';
import axios from 'axios';

import ErrorFlash from './ErrorFlash';
import SuccessFlash from './SuccessFlash';

export class RegisterForm extends Component {

	state = {
		invalid_fields: [],
		error_message: '',
		success_message: '',
		user: {
			firstname: '',
			lastname: '',
			email: '',
			phone: '',
			password: '',
			password_verify: ''
		}
	}

	onChange = (e) => {
		let user = this.state.user;
		user[[e.target.name]] = e.target.value;
		this.setState({user});
	}

	onSubmit = async (e) => {
		e.preventDefault();
		await axios.post('/auth/register', this.state.user)
			.then(res => {
				this.setState({ success_message: "You've been registered!" });
				this.setState({ error_message: "" });
			})
			.catch(err => {
				this.setState({error_message: "Please fix the following fields: "});
				this.setState({invalid_fields: err.response.data.invalid_fields});
			});
	}

	render() {
		return (
			<div>
				<h2>Register</h2>
				<ErrorFlash invalid_fields={this.state.invalid_fields} message={this.state.error_message}/>
				<SuccessFlash message={this.state.success_message} />
				<form onSubmit={this.onSubmit}>
					<div className="form-row">
						<div className="form-group col-md">
							<label> First Name </label>
							<input type="text" name="firstname" value={this.state.user.firstname} className="form-control" placeholder="Bobby" onChange={this.onChange}/>
						</div>
						<div className="form-group col-md">
							<label> Last Name </label>
							<input type="text" name="lastname" value={this.state.user.lastname} className="form-control" placeholder="Kent" onChange={this.onChange}/>
						</div>
					</div>
					<div className="form-group">
						<label> Email </label>
						<input type="email" name="email" value={this.state.user.email} className="form-control" placeholder="robo.bob@gmail.com" onChange={this.onChange}/>
					</div>
					<div className="form-group">
						<label> Password </label>
						<input type="password" name="password" value={this.state.user.password} className="form-control" placeholder="we store" onChange={this.onChange}/>
					</div>
					<div className="form-group">
						<label> Verify password </label>
						<input type="password" name="password_verify" value={this.state.user.password_verify} className="form-control" placeholder="in plain text" onChange={this.onChange}/>
					</div>
					<button type="submit" className="btn btn-sm btn-primary"> Register </button>
				</form>
			</div>
		)
	}
}

export default RegisterForm;
