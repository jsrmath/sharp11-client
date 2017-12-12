var React = require('react');
var _ = require('underscore');
var classNames = require('classnames');
var Modal = require('react-bootstrap-modal');
var Button = require('./Button.jsx');

var loadingChord = <div className="automatonItem" key="automaton-loading">
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
      key: 'C',
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
    e.preventDefault();
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
    this.props.playChord(symbol.toChord(this.state.key).name);
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
    var key = this.state.key;
    var that = this;

    if (!this.sequence().length() && loadingAt !== 'end') {
      return <p className="automatonItem">Press <kbd>A</kbd> to add your first chord</p>;
    }

    return _.map(this.sequence().transitions, function (transition, i) {
      var classes = classNames('automatonItem', {automatonItemActive: i === that.state.index});

      if (loadingAt === 'index' && i === that.state.index) {
        return loadingChord;
      }

      return (
        <div className={classes} key={'automaton-' + i} onClick={_.partial(that.setIndex, i)}>
          <div className="automatonChord"><span>{transition.symbol.toChord(key).name}</span></div>
          <div className="automatonState">{transition.to.name}</div>
        </div>
      );
    });
  },

  handleKeyChange: function (e) {
    this.setState({key: e.target.value});
  },

  renderKeySelect: function () {
    var keys = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    var keyOptions = _.map(keys, function (key) {
      return <option key={key} value={key}>{key}</option>
    });

    return (
      <div className="automatonKeyChange">
        <label htmlFor="keyChange">Key:</label>
        <select id="keyChange" value={this.state.key} onChange={this.handleKeyChange}>
          {keyOptions}
        </select>
      </div>
    );
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
            <li>
              Play around with the code behind the automaton <a href="https://github.com/jsrmath/sharp11-jza">here</a>
            </li>
            <li>
              Note: The automaton does not differentiate between major and minor keys
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
          {this.renderKeySelect()}
          {this.renderChords()}
          {this.state.loadingAt === 'end' ? loadingChord : null}
        </div>
        <Modal
          className="automatonModal"
          show={this.state.showAutomatonModal}
          onHide={this.toggleAutomatonModal}
          aria-labelledby="ModalHeader"
        >
          <Modal.Header>
            <Modal.Title>Jazz Automaton</Modal.Title>
            <a href="#" className="automatonModalClose" onClick={this.toggleAutomatonModal} />
          </Modal.Header>
          <Modal.Body>
            <p>
              The goal of this project is to create a computer model that understands jazz. 
              Our definition of "understand" in this context is two-fold:
              our model needs to be able to produce jazz and it needs to provide some sort of explanation about what makes a particular piece of music jazz.
              Because of how complex, intricate, and difficult to define jazz is, this goal is quite lofty, and so we have restricted our model to only dealing with sequences of chord changes, ignoring durations and limiting ourselves to six chord qualities: major (M), minor (m), dominant (x), half-diminished (ø), diminished (o), and suspended (s).
              This reduction, which also ignores important features like melody, rhythm, voicing, instrumentation, etc., allowed us to extract a finite, definable aspect of jazz from which we can draw meaningful conclusions.
            </p>
            <p>
              To make our model to understand jazz harmony, we employed a combination of music theory and machine learning.
              First, we defined a <a href="https://en.wikipedia.org/wiki/Finite-state_machine">finite-state automaton</a> model based on music theory.
              This model defines what harmonic pathways are permissable and what their theoretical explanations are.
              An automaton consists of a set of states and a set of transitions from state to state.
              Our automaton models chord functions as states and chords as transitions.
              For example, if you are in a subdominant state (i.e., you have just played a subdominant chord), you can play a <em>V</em> chord and it is a dominant chord.
              We represent this by having <em>V</em> as a transition from the subdominant state to the dominant state.
              The music theoretical framework we used for this model is a modified version of <a href="#" onClick={_.compose(this.toggleAutomatonModal, this.toggleFunctionalBassModal)}>functional bass analysis</a>.
            </p>
            <p>
              After defining the states and transitions, we trained the model using the <a href="https://musiccog.ohio-state.edu/home/index.php/iRb_Jazz_Corpus">iRb corpus</a>, a corpus of over a thousand jazz standards (available for use with Sharp11 <a href="https://github.com/jsrmath/sharp11-irb">here</a>).
              This adds probabilities to the transitions based on how they are actually used in jazz.
              Now, not only can we say what sequences of chords/functions are allowed, we can say with what probability they should occur.
              Using this, we can generate new chord progressions by starting in some state and following transitions based on those probabilities, which is what this interface allows you to do.
            </p>
            <p>For a more detailed and technical explanation of the automaton, read the paper <a href="https://github.com/jsrmath/sharp11-jza/blob/master/paper.pdf">here</a>.</p>
          </Modal.Body>
        </Modal>
        <Modal
          className="automatonModal"
          show={this.state.showFunctionalBassModal}
          onHide={this.toggleFunctionalBassModal}
          aria-labelledby="ModalHeader"
        >
          <Modal.Header>
            <Modal.Title>Functional Bass Analysis</Modal.Title>
            <a href="#" className="automatonModalClose" onClick={this.toggleFunctionalBassModal} />
          </Modal.Header>
          <Modal.Body>
            <p>
              Functional bass analysis was developed by <a href="https://yalemusic.yale.edu/people/ian-quinn">Ian Quinn</a> and adapted for jazz by <a href="https://yalemusic.yale.edu/people/brian-kane">Brian Kane</a>.
              The general idea is that a chord's function is primarily determined by its bass note and a designation of tonic, subdominant, or dominant, terms that have been expanded from their original classical meaning.
              Tonic chords tend to have roots of 1, 3, 6; subdominant chords: 2, 4, 6; and dominant chords: 3, 5, 7.
              As an example, we would label a typical <em>ii</em>-<em>V</em>-<em>I</em> progression as: Subdominant 2, Dominant 5, Tonic 1.
              This approach makes sense for jazz, because distinctions in quality tend to be less important and musicians tend to alter qualities when reharmonizing.
            </p>
            <p>
              The purpose of functional bass in the automaton is to allow us to define a simple basis for our harmonic universe, which we can expand upon by using reharmonization techniques from jazz practice.
              Programmatically, we apply transformations to the automaton to say things like, any time you have a chord with dominant quality (note: this is different than dominant function), it can be substituted with an equivalent chord a tritone away (commonly known as a tritone substitution).
              In the automaton, we are simply selecting all transitions with dominant quality and adding new transitions between the same states.
              The way this is implemented currently will cause certain labels to appear incorrect, since a chord's function is determined by its destination state.
              For example, a tritone substituted Dominant 5 chord will still have a label of Dominant 5 even though the bass is technically different.
            </p>
            <p>
              The following reharmonizations have been applied to the automaton.  Some of them result in new labels for chords that fall outside of the basic parameters of functional bass:
            </p>
            <p>
              <strong>Suspended chords</strong> (or sus chords) are typically used to reharmonize V chords and ii-V progressions.
              We can extend this idea to allow any dominant chord to be suspended and let the data tell us how idiomatic different sus chords actually are.
            </p>
            <p>
              <strong>Diminished chords</strong> share many notes with four different dominant <em>b9</em> chords and could thus be substituted for any of them.
              However, we will only allow the dominant chord a major third below, because it comes from the relationship between <em>V</em> and <em>vii</em> in classical harmony.
              Note: the bass notes will appear wrong here: since a diminished chord is considered a substitute for a dominant chord, it will still have the label of the dominant chord.
            </p>
            <p>
              <strong>Diminished approaching chords</strong> precede a minor chord a half-step below.
              This technique works because the two chords share many notes.
            </p>
            <p>
              The <strong>tritone substitution</strong> is one of the most popular reharmonizations in jazz.
              It works harmonically, because for two dominant seventh chords a tritone apart, the third of one is the seventh of the other and vice-versa.
            </p>
            <p>
              An <strong>applied dominant</strong> (labeled as V / [chord]) can be placed before any major or minor chord.
            </p>
            <p>
              A <strong>chromatic approaching chord</strong> is a dominant seventh chord a half-step below a chord with major or minor quality.
              Such chords can also approach from above, but these are represented as tritone substitutions of applied dominants.
            </p>
            <p>
              The arrival of a major or minor chord can be <strong>tonicized</strong> with a <em>ii</em>-<em>V</em>-<em>I</em> or <em>iiø</em>-<em>V</em>-<em>I</em> progression in that key.
              However, in keeping with the spirit of functional-bass theory, we will extend the chord qualities that are allowed, as it is the progression of bass notes that is fundamental, and we can let the song data determine the probabilities of different qualities.
              We also allow half-diminished chords to be tonicized to accommodate for sequences like <em>iiiø</em>-<em>VIx</em>-<em>iiø</em> that might be part of a larger sequence setting up the tonic.
            </p>
            <p>
              <strong>Unpacking</strong> refers to preceding a chord of dominant quality with a minor chord a perfect fourth below, or the reverse, following a chord of minor quality with a chord of dominant quality a perfect fourth above.
              This technique works, because we are treating the chords as part of a partial <em>ii</em>-<em>V</em> progression.
              In general, there is a strong relationship between these chord pairs on jazz.
            </p>
            <p>
              <strong>Neighbor chords</strong> go in between two chords that are the same and serve as a means of emphasizing the chord.
              Since we have data to tell us what chords work well as neighbor chord, our model can allow any chord to serve as a neighbor.
            </p>
            <p>
              A <strong>passing chord</strong> can be inserted between chords of the same function to create an ascending or descending bassline.
              For simplicity, we will only allow for diatonic passing chords.
            </p>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
});