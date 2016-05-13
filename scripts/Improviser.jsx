var s11 = require('sharp11');
var _ = require('underscore');
var React = require('react');
var Button = require('./Button.jsx');

var chart = s11.improv.create({dissonance: 0}).over('chart', require('../node_modules/sharp11/sample/charts').myFunnyValentineFull);

module.exports = React.createClass({
  render: function () {
    return (
      <div className="improviser col-md-6">
        <h2>Improvise</h2>
        <Button handleClick={_.partial(this.props.playImprov, chart)} text="Improvise" />
      </div>
    );
  }
});