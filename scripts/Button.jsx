var React = require('react');
var classNames = require('classnames');

module.exports = React.createClass({
  render: function () {
    var classes = classNames('btn', 'btn-primary', {'form-control': this.props.formControl});

    return (
      <div onClick={this.props.handleClick} className={classes}>
        {this.props.text}
      </div>
    );
  }
});