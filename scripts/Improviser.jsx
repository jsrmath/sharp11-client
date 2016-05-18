var s11 = require('sharp11');
var _ = require('underscore');
var React = require('react');
var Button = require('./Button.jsx');
var Range = require('./Range.jsx');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      songValue: 'myFunnyValentine',
      improv: null,
      tempo: 120,
      dissonance: 0.5,
      changeDirection: 0.25,
      jumpiness: 0.25,
      rests: 0.35,
      rhythmicVariety: 0.75,
    }
  },

  generate: function () {
    var songValue = this.state.songValue;
    var improv = s11.improv.create({
      dissonance: this.state.dissonance,
      changeDir: this.state.changeDirection,
      jumpiness: this.state.jumpiness,
      rests: [this.state.rests, 0],
      rhythmicVariety: [0, this.state.rhythmicVariety],
      useSixteenths: this.state.tempo < 160,
    }).over('chart', this.props.songs[songValue].chart);

    this.setState({improv: improv});
  },

  play: function () {
    this.props.playImprov(this.state.improv, {tempo: this.state.tempo});
  },

  saveURL: function () {
    var midi = this.state.improv.midi({tempo: this.state.tempo});
    var base64 = midi.data.toString('base64');
    return 'data:audio/midi;base64,' + base64;
  },

  handleSelect: function (e) {
    this.setState({
      songValue: e.target.value,
      tempo: this.props.songs[e.target.value].tempo
    });
  },

  updateRange: function (prop, value) {
    var state = {};
    state[prop] = Number(value);
    this.setState(state);
  },

  render: function () {
    var songList = _.map(this.props.songs, function (song, id) {
      return (
        <option key={id} value={id}>{song.name}</option>
      );
    });

    return (
      <div className="improviser col-md-6">
        <h2 className="col-sm-12">Improvise</h2>
        <p className="col-sm-12">Sharp11 will randomly generate a jazz improvisation over any chord changes.  A few sample songs are available here.</p>
        <div className="inline-form">
          <div className="form-group">
            <div className="col-sm-6">
              <label className="control-label">Song</label>
              <select className="form-control" value={this.state.songValue} onChange={this.handleSelect}>
                {songList}
              </select>
            </div>
          </div>

          <Range name="Tempo" min="60" max="200" step="5" updateRange={this.updateRange} value={this.state.tempo} />
          <Range name="Dissonance" min="0" max="1" updateRange={this.updateRange} value={this.state.dissonance} />
          <Range name="Change Direction" min="0" max="0.5" updateRange={this.updateRange} value={this.state.changeDir} />
          <Range name="Jumpiness" min="0" max="0.5" updateRange={this.updateRange} value={this.state.jumpiness} />
          <Range name="Rests" min="0" max="0.5" updateRange={this.updateRange} value={this.state.rests} />
          <Range name="Rhythmic Variety" min="0" max="1" updateRange={this.updateRange} value={this.state.rhythmicVariety} />

          <div className="col-sm-12 btn-group">
            <Button handleClick={this.generate} text="Generate" />
            <Button handleClick={this.play} text="Play" hidden={!this.state.improv} />
            <Button getHref={this.saveURL} download={this.state.songValue + '.mid'} text="Save" hidden={!this.state.improv} />
          </div>
        </div>
      </div>
    );
  }
});