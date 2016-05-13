var s11 = require('sharp11');
var React = require('react');
var classNames = require('classnames');

module.exports = React.createClass({
  note: function () {
    return this.props.note.clean().withAccidental(this.props.acc);
  },

  keyColor: function () {
    return this.note().acc === 'n' ? 'whiteKey' : 'blackKey'
  },

  render: function () {
    var classes = classNames('pianoKey', this.keyColor(), {pressed: this.props.pressed});

    return (
      <div className={classes} onClick={this.props.pressKey}>
        <div>{this.note().name}</div>
      </div>
    );
  }
});