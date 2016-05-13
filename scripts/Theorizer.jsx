var React = require('react');
var Button = require('./Button.jsx');

module.exports = React.createClass({
  render: function () {
    return (
      <div className="theorizer col-md-6">
        <h2>Theorize</h2>
        <p>Enter a chord/scale to play or an interval to transpose by.</p>
        <p>Examples: <em>Gm7b5</em>, <em>F Mixolydian</em>, <em>P4</em>.</p>
        <div className="input-group">
          <input type="text" className="form-control" onChange={this.props.handleInput} />
          <span className="input-group-btn">
            <Button handleClick={this.props.play} text="Play" />
          </span>
        </div>
      </div>
    );
  }
});