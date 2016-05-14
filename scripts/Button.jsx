var React = require('react');
var classNames = require('classnames');

module.exports = React.createClass({
  render: function () {
    var classes = classNames('btn', 'btn-primary', {'form-control': this.props.formControl});

    if (this.props.hidden) return null;

    if (this.props.getHref) return (
      <a href={this.props.getHref()} download={this.props.download} className={classes}>
        {this.props.text}
      </a>
    );

    return (
      <div onClick={this.props.handleClick} className={classes}>
        {this.props.text}
      </div>
    );
  }
});