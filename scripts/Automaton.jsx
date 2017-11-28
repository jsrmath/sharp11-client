var React = require('react');
var _ = require('underscore');
var classNames = require('classnames');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      sequence: this.props.jza.buildSequence(),
      index: -1
    };
  },

  componentDidMount: function () {
    window.addEventListener('keydown', this.handleKeyDown);
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this.handleKeyDown);
  },

  handleKeyDown: function (e) {
    switch (e.keyCode) {
      case 37:
        this.moveLeft();
        break;
      case 39:
        this.moveRight();
        break;
      case 32:
        this.play();
        break;
      case 65:
        this.addChord();
        break;
      case 68:
        this.removeChord();
        break;
      case 82:
        this.reharmonize();
        break;
    }
  },

  moveLeft: function () {
    var index = this.state.index;
    if (index > 0) {
      this.setState({index: index - 1});
    }
  },

  moveRight: function () {
    var index = this.state.index;
    if (index < this.state.sequence.length() - 1) {
      this.setState({index: index + 1});
    }
  },

  play: function () {
    var symbol = this.state.sequence.index(this.state.index).symbol;
    var chord = symbol.toChord();
    this.props.playChord(chord.name);
  },

  addChord: function () {
    var i = this.state.index;
    var seq = this.state.sequence.add();

    if (seq.length() === 1) i = 0;
    this.setState({sequence: seq, index: i});
  },

  removeChord: function () {
    var i = this.state.index;
    var seq = this.state.sequence.remove();

    if (i >= seq.length() - 1) i = seq.length() - 1;
    this.setState({sequence: seq, index: i});
  },

  reharmonize: function () {
    var i = this.state.index;
    var seq = this.state.sequence.reharmonizeAtIndex(i);

    if (i >= seq.length() - 1) i = seq.length() - 1;
    this.setState({sequence: seq, index: i});
  },

  setActiveIndex: function (i) {
    this.setState({index: i});
  },

  renderChords: function () {
    var activeIndex = this.state.index;
    var setActiveIndex = this.setActiveIndex;

    return _.map(this.state.sequence.transitions, function (transition, i) {
      var classes = classNames('automatonItem', {automatonItemActive: i === activeIndex});
      return (
        <div className={classes} key={'automaton-' + i} onClick={_.partial(setActiveIndex, i)}>
          <div className="automatonChord"><span>{transition.symbol.toChord().name}</span></div>
          <div className="automatonState">{transition.to.name}</div>
        </div>
      );
    });
  },

  render: function () {
    return (
      <div className="automaton col-md-12" onKeyDown={this.handleKeyDown}>
        <p>Controls:</p>
        <ul>
          <li>Left/right: scroll between chords</li>
          <li>Spacebar: play current chord</li>
          <li>A: add chord to the end of the sequence</li>
          <li>D: delete chord from the end of the sequence</li>
          <li>R: reharmonize selected chord</li>
        </ul>
        <div>
          {this.renderChords()}
        </div>
      </div>
    );
  }
});