var React = require('react');
var Button = require('./Button.jsx');

module.exports = React.createClass({
  render: function () {
    return (
      <div className="controls">
        <div className="btn-group pianoButtons">
          <Button handleClick={this.props.toggleAccidentals} text="# &harr; b" />
          <Button handleClick={this.props.stop} text="Clear" />
        </div>
        <span className="display">{this.props.display()}</span>
      </div>
    );
  }
});