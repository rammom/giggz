import React, { Component } from 'react';

export class SuccessFlash extends Component {

	gen_alert = () => {
		if (this.props.message.length === 0) return null;
		return (
			<div className="alert alert-success">
				{this.props.message}
			</div>
		);
	}

	render() {
		return (
			<React.Fragment>
				{this.gen_alert()}
			</ React.Fragment>
		)
	}
}

export default SuccessFlash;
