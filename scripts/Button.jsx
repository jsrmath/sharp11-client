var React = require('react');

module.exports = React.createClass({
  render: function () {
    return (
      <div onClick={this.props.handleClick} className="btn btn-primary">
        {this.props.text}
      </div>
    );
  }
});