define(["exports", "module", "react", "./constants"], function (exports, module, _react, _constants) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var React = _interopRequire(_react);

  var constants = _interopRequire(_constants);

  var BootstrapMixin = {
    propTypes: {
      bsClass: React.PropTypes.oneOf(Object.keys(constants.CLASSES)),
      bsStyle: React.PropTypes.oneOf(Object.keys(constants.STYLES)),
      bsSize: React.PropTypes.oneOf(Object.keys(constants.SIZES))
    },

    getBsClassSet: function getBsClassSet() {
      var classes = {};

      var bsClass = this.props.bsClass && constants.CLASSES[this.props.bsClass];
      if (bsClass) {
        classes[bsClass] = true;

        var prefix = bsClass + "-";

        var bsSize = this.props.bsSize && constants.SIZES[this.props.bsSize];
        if (bsSize) {
          classes[prefix + bsSize] = true;
        }

        var bsStyle = this.props.bsStyle && constants.STYLES[this.props.bsStyle];
        if (this.props.bsStyle) {
          classes[prefix + bsStyle] = true;
        }
      }

      return classes;
    },

    prefixClass: function prefixClass(subClass) {
      return constants.CLASSES[this.props.bsClass] + "-" + subClass;
    }
  };

  module.exports = BootstrapMixin;
});