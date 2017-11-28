var React = require('react');
var Button = require('./Button.jsx');

module.exports = React.createClass({
  handleKeyDown: function (e) {
    if (e.keyCode === 13) this.props.play();
  },

  render: function () {
    return (
      <div className="theorizer">
        <div className="col-md-12">
          <p>
            Enter a chord/scale to play or an interval to transpose selected keys by, e.g.:
            <em>Gm7b5</em> <em>F Mixolydian</em> <em>P4</em>
          </p>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <input type="text"
                   className="form-control"
                   value={this.props.value}
                   onChange={this.props.handleInput}
                   onKeyDown={this.handleKeyDown} />
            <span className="input-group-btn">
              <Button handleClick={this.props.play} text="Play" />
            </span>
          </div>
        </div>
      </div>
    );
  }
});