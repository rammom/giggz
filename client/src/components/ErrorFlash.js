import React, { Component } from 'react';

export class ErrorFlash extends Component {

	gen_alert = () => {
		if (!this.props.message || this.props.message.length === 0) return null;
		if (this.props.invalid_fields){
			let elems = [];
			for (let i = 0; i < this.props.invalid_fields.length; ++i) {
				elems.push((
					<li key={i}> {this.props.invalid_fields[i]} </li>
				));
			};
			return (
				<div className="alert alert-danger">
					{this.props.message ? this.props.message : ''}
					<ul>
						{elems}
					</ul>
				</div>
			)
		}
		return (
			<div className="alert alert-danger">
				{this.props.message}
			</div>
		)
		
	}

	render() {
		return (
			<div>
				{this.gen_alert()}
			</div>
		)
	}
}

export default ErrorFlash;
