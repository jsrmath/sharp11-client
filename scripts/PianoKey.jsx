var s11 = require('sharp11');
var React = require('react');
var classNames = require('classnames');

module.exports = React.createClass({
  note: function () {
    var note = this.props.note.clean();
    if (this.props.acc !== this.props.note.acc) {
      note = note.toggleAccidental();
    }

    return note;
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