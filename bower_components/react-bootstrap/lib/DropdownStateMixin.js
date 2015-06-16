define(["exports", "module", "react", "./utils/EventListener"], function (exports, module, _react, _utilsEventListener) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var React = _interopRequire(_react);

  var EventListener = _interopRequire(_utilsEventListener);

  /**
   * Checks whether a node is within
   * a root nodes tree
   *
   * @param {DOMElement} node
   * @param {DOMElement} root
   * @returns {boolean}
   */
  function isNodeInRoot(node, root) {
    while (node) {
      if (node === root) {
        return true;
      }
      node = node.parentNode;
    }

    return false;
  }

  var DropdownStateMixin = {
    getInitialState: function getInitialState() {
      return {
        open: false
      };
    },

    setDropdownState: function setDropdownState(newState, onStateChangeComplete) {
      if (newState) {
        this.bindRootCloseHandlers();
      } else {
        this.unbindRootCloseHandlers();
      }

      this.setState({
        open: newState
      }, onStateChangeComplete);
    },

    handleDocumentKeyUp: function handleDocumentKeyUp(e) {
      if (e.keyCode === 27) {
        this.setDropdownState(false);
      }
    },

    handleDocumentClick: function handleDocumentClick(e) {
      // If the click originated from within this component
      // don't do anything.
      if (isNodeInRoot(e.target, React.findDOMNode(this))) {
        return;
      }

      this.setDropdownState(false);
    },

    bindRootCloseHandlers: function bindRootCloseHandlers() {
      this._onDocumentClickListener = EventListener.listen(document, "click", this.handleDocumentClick);
      this._onDocumentKeyupListener = EventListener.listen(document, "keyup", this.handleDocumentKeyUp);
    },

    unbindRootCloseHandlers: function unbindRootCloseHandlers() {
      if (this._onDocumentClickListener) {
        this._onDocumentClickListener.remove();
      }

      if (this._onDocumentKeyupListener) {
        this._onDocumentKeyupListener.remove();
      }
    },

    componentWillUnmount: function componentWillUnmount() {
      this.unbindRootCloseHandlers();
    }
  };

  module.exports = DropdownStateMixin;
});