define(["exports", "module", "react", "./BootstrapMixin", "classnames", "./utils/ValidComponentChildren", "./utils/createChainedFunction"], function (exports, module, _react, _BootstrapMixin, _classnames, _utilsValidComponentChildren, _utilsCreateChainedFunction) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var React = _interopRequire(_react);

  var cloneElement = _react.cloneElement;

  var BootstrapMixin = _interopRequire(_BootstrapMixin);

  var classSet = _interopRequire(_classnames);

  var ValidComponentChildren = _interopRequire(_utilsValidComponentChildren);

  var createChainedFunction = _interopRequire(_utilsCreateChainedFunction);

  var Navbar = React.createClass({
    displayName: "Navbar",

    mixins: [BootstrapMixin],

    propTypes: {
      fixedTop: React.PropTypes.bool,
      fixedBottom: React.PropTypes.bool,
      staticTop: React.PropTypes.bool,
      inverse: React.PropTypes.bool,
      fluid: React.PropTypes.bool,
      role: React.PropTypes.string,
      componentClass: React.PropTypes.node.isRequired,
      brand: React.PropTypes.node,
      toggleButton: React.PropTypes.node,
      toggleNavKey: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
      onToggle: React.PropTypes.func,
      navExpanded: React.PropTypes.bool,
      defaultNavExpanded: React.PropTypes.bool
    },

    getDefaultProps: function getDefaultProps() {
      return {
        bsClass: "navbar",
        bsStyle: "default",
        role: "navigation",
        componentClass: "Nav"
      };
    },

    getInitialState: function getInitialState() {
      return {
        navExpanded: this.props.defaultNavExpanded
      };
    },

    shouldComponentUpdate: function shouldComponentUpdate() {
      // Defer any updates to this component during the `onSelect` handler.
      return !this._isChanging;
    },

    handleToggle: function handleToggle() {
      if (this.props.onToggle) {
        this._isChanging = true;
        this.props.onToggle();
        this._isChanging = false;
      }

      this.setState({
        navExpanded: !this.state.navExpanded
      });
    },

    isNavExpanded: function isNavExpanded() {
      return this.props.navExpanded != null ? this.props.navExpanded : this.state.navExpanded;
    },

    render: function render() {
      var classes = this.getBsClassSet();
      var ComponentClass = this.props.componentClass;

      classes["navbar-fixed-top"] = this.props.fixedTop;
      classes["navbar-fixed-bottom"] = this.props.fixedBottom;
      classes["navbar-static-top"] = this.props.staticTop;
      classes["navbar-inverse"] = this.props.inverse;

      return React.createElement(
        ComponentClass,
        _extends({}, this.props, { className: classSet(this.props.className, classes) }),
        React.createElement(
          "div",
          { className: this.props.fluid ? "container-fluid" : "container" },
          this.props.brand || this.props.toggleButton || this.props.toggleNavKey != null ? this.renderHeader() : null,
          ValidComponentChildren.map(this.props.children, this.renderChild)
        )
      );
    },

    renderChild: function renderChild(child, index) {
      return cloneElement(child, {
        navbar: true,
        collapsable: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.eventKey,
        expanded: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.eventKey && this.isNavExpanded(),
        key: child.key ? child.key : index
      });
    },

    renderHeader: function renderHeader() {
      var brand = undefined;

      if (this.props.brand) {
        if (React.isValidElement(this.props.brand)) {
          brand = cloneElement(this.props.brand, {
            className: classSet(this.props.brand.props.className, "navbar-brand")
          });
        } else {
          brand = React.createElement(
            "span",
            { className: "navbar-brand" },
            this.props.brand
          );
        }
      }

      return React.createElement(
        "div",
        { className: "navbar-header" },
        brand,
        this.props.toggleButton || this.props.toggleNavKey != null ? this.renderToggleButton() : null
      );
    },

    renderToggleButton: function renderToggleButton() {
      var children = undefined;

      if (React.isValidElement(this.props.toggleButton)) {

        return cloneElement(this.props.toggleButton, {
          className: classSet(this.props.toggleButton.props.className, "navbar-toggle"),
          onClick: createChainedFunction(this.handleToggle, this.props.toggleButton.props.onClick)
        });
      }

      children = this.props.toggleButton != null ? this.props.toggleButton : [React.createElement(
        "span",
        { className: "sr-only", key: 0 },
        "Toggle navigation"
      ), React.createElement("span", { className: "icon-bar", key: 1 }), React.createElement("span", { className: "icon-bar", key: 2 }), React.createElement("span", { className: "icon-bar", key: 3 })];

      return React.createElement(
        "button",
        { className: "navbar-toggle", type: "button", onClick: this.handleToggle },
        children
      );
    }
  });

  module.exports = Navbar;
});