var React = require('react');
var S = require('string');

module.exports = React.createClass({
  attr: function () {
    return S(this.props.name.toLowerCase()).camelize().s;
  },

  handleChange: function (e) {
    this.props.updateRange(this.attr(), e.target.value);
  },

  render: function () {
    return (
      <div className="form-group improvRange">
        <label className="control-label">{this.props.name}</label>
        <input
          type="range"
          min={this.props.min}
          max={this.props.max}
          step={this.props.step || .05}
          onChange={this.handleChange}
          value={this.props.value} />
      </div>
    );
  }
});