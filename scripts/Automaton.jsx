var React = require('react');
var _ = require('underscore');
var classNames = require('classnames');
var Modal = require('react-bootstrap-modal');
var Button = require('./Button.jsx');

loadingChord = <div className="automatonItem" key="automaton-loading">
  <div className="automatonChord"><span>...</span></div>
  <div className="automatonState">Loading</div>
</div>;

module.exports = React.createClass({
  getInitialState: function () {
    return {
      sequenceStack: [this.props.jza.buildSequence()],
      index: -1,
      loadingAt: null,
      showAutomatonModal: false,
      showFunctionalBassModal: false,
    };
  },

  componentDidMount: function () {
    window.addEventListener('keydown', this.handleKeyDown);
  },

  componentWillUnmount: function () {
    window.removeEventListener('keydown', this.handleKeyDown);
  },

  sequence: function () {
    return _.last(this.state.sequenceStack);
  },

  index: function () {
    return this.state.index;
  },

  setSequence: function (seq) {
    this.setState({sequenceStack: this.state.sequenceStack.concat([seq])});
  },

  setIndex: function (i) {
    this.setState({index: i});
  },

  setSequenceAndIndex: function (seq, i) {
    this.setState({sequenceStack: this.state.sequenceStack.concat([seq]), index: i});
  },

  handleKeyDown: function (e) {
    switch (e.keyCode) {
      case 32:
        this.play();
        break;
      case 37:
        this.moveLeft();
        break;
      case 39:
        this.moveRight();
        break;
      case 65:
        this.executeWithLoadingSpinner(this.addChord, 'end');
        break;
      case 67:
        this.clear();
        break;
      case 68:
        this.removeChord();
        break;
      case 82:
        this.executeWithLoadingSpinner(this.reharmonize, 'index');
        break;
      case 85:
        this.undo();
        break;
    }
  },

  executeWithLoadingSpinner: function (func, loadingAt) {
    var setState = this.setState.bind(this);
    setState({loadingAt: loadingAt});
    setTimeout(function () {
      func();
      setState({loadingAt: null});
    }, 0);
  },

  moveLeft: function () {
    if (this.index() > 0) {
      this.setIndex(this.index() - 1);
    }
  },

  moveRight: function () {
    if (this.index() < this.sequence().length() - 1) {
      this.setIndex(this.index() + 1);
    }
  },

  play: function () {
    var symbol = this.sequence().index(this.index()).symbol;
    this.props.playChord(symbol.toChord().name);
  },

  addChord: function () {
    var seq = this.sequence().add();
    var i = seq.length() === 1 ? 0 : this.index();

    this.setSequenceAndIndex(seq, i);
  },

  removeChord: function () {
    var seq = this.sequence().remove();
    var i = this.index() >= seq.length() - 1 ? seq.length() - 1 : this.index();

    this.setSequenceAndIndex(seq, i);
  },

  reharmonize: function () {
    var seq = this.sequence().reharmonizeAtIndex(this.index());
    var i = this.index() >= seq.length() - 1 ? seq.length() - 1 : this.index();

    this.setSequenceAndIndex(seq, i);
  },

  undo: function () {
    var that = this;
    if (this.state.sequenceStack.length < 2) return;

    this.setState({sequenceStack: this.state.sequenceStack.slice(0, -1)}, function () {
      if (that.index() >= that.sequence().length()) {
        that.setIndex(that.sequence().length() - 1);
      }
    });
  },

  clear: function () {
    this.setState({
      sequenceStack: this.state.sequenceStack.concat([this.props.jza.buildSequence()]),
      index: -1
    });
  },

  renderChords: function () {
    var loadingAt = this.state.loadingAt;
    var that = this;

    if (!this.sequence().length() && loadingAt !== 'end') {
      return <p>Press <kbd>A</kbd> to add your first chord</p>;
    }

    return _.map(this.sequence().transitions, function (transition, i) {
      var classes = classNames('automatonItem', {automatonItemActive: i === that.state.index});

      if (loadingAt === 'index' && i === that.state.index) {
        return loadingChord;
      }

      return (
        <div className={classes} key={'automaton-' + i} onClick={_.partial(that.setIndex, i)}>
          <div className="automatonChord"><span>{transition.symbol.toChord().name}</span></div>
          <div className="automatonState">{transition.to.name}</div>
        </div>
      );
    });
  },

  toggleAutomatonModal: function () {
    this.setState({showAutomatonModal: !this.state.showAutomatonModal});
  },

  toggleFunctionalBassModal: function () {
    this.setState({showFunctionalBassModal: !this.state.showFunctionalBassModal});
  },

  render: function () {
    return (
      <div className="automaton">
        <div className="col-md-6">
          <ul>
            <li>
              Build a sequence of jazz chords using Sharp11's <a href="#" onClick={this.toggleAutomatonModal}>probabilistic automaton model</a>
            </li>
            <li>
              The generated chords will have a corresponding <a href="#" onClick={this.toggleFunctionalBassModal}>functional-bass analysis</a>
            </li>
          </ul>
        </div>
        <div className="col-md-6">
          <ul>
            <li><kbd>⇦</kbd> / <kbd>⇨</kbd>: scroll between chords</li>
            <li><kbd>Space</kbd>: play current chord</li>
            <li><kbd>A</kbd>dd chord to the end of the sequence</li>
            <li><kbd>D</kbd>elete chord from the end of the sequence</li>
            <li><kbd>R</kbd>eharmonize selected chord</li>
            <li><kbd>U</kbd>ndo last change</li>
            <li><kbd>C</kbd>lear sequence</li>
          </ul>
        </div>
        <div className="col-md-12">
          {this.renderChords()}
          {this.state.loadingAt === 'end' ? loadingChord : null}
        </div>
        <Modal show={this.state.showAutomatonModal}
          onHide={this.toggleAutomatonModal}
          aria-labelledby="ModalHeader"
        >
          <Modal.Header>
            <Modal.Title>Jazz Automaton</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Content TBD
          </Modal.Body>
        </Modal>
        <Modal show={this.state.showFunctionalBassModal}
          onHide={this.toggleFunctionalBassModal}
          aria-labelledby="ModalHeader"
        >
          <Modal.Header>
            <Modal.Title>Functional Bass Analysis</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Content TBD
          </Modal.Body>
        </Modal>
      </div>
    );
  }
});