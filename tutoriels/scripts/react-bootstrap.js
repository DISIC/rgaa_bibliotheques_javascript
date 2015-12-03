/**
 *	The MIT License (MIT)
 *
 *	Copyright (c) 2015 Félix Girault (V-Technologies) pour le compte de la DISIC
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy
 *	of this software and associated documentation files (the "Software"), to deal
 *	in the Software without restriction, including without limitation the rights
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *	copies of the Software, and to permit persons to whom the Software is
 *	furnished to do so, subject to the following conditions:
 *
 *	The above copyright notice and this permission notice shall be included in all
 *	copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *	SOFTWARE.
 */
(function(root) {

	'use strict';

	/**
	 *	Generates a unique id.
	 *
	 *	@see http://stackoverflow.com/a/105074/2391359
	 *	@return string Uid.
	 */
	function generateUid() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16);
	}



	/**
	 *	Accordion.
	 */
	var Accordion = root.ReactBootstrap.Accordion;

	/**
	 *	A wrapper that adds an accessibility layer to the
	 *	standard Accordion.
	 *	This is done in a completely "non-React" way, as it
	 *	would require a rewrite of the components, making the
	 *	changes harder to follow.
	 */
	root.AccessibleAccordion = React.createClass({

		/**
		 *	Returns the initial state.
		 *
		 *	@return object State.
		 */
		getInitialState: function() {
			return {
				activeKey: this.props.defaultActiveKey || null
			};
		},

		/**
		 *	Attaches event handlers and sets up the markup.
		 */
		componentDidMount: function() {
			this.node = React.findDOMNode(this);
			this.tabs = this.node.querySelectorAll('.panel-heading a');
			this.panes = this.node.getElementsByClassName('panel-collapse');

			this.node.addEventListener('keydown', this.handleKeyDown);
			document.addEventListener('focus', this.handleFocus, true);

			this.setupAttributes();
			this.setupPanesAttributes();
			this.updatePanesAttributes();
		},

		/**
		 *	Detaches event handlers.
		 */
		componentWillUnmount: function() {
			this.node.removeEventListener('keydown', this.handleKeyDown);
			document.removeEventListener('focus', this.handleFocus, true);
		},

		/**
		 *	Sets up appropriate roles and ids on the elements.
		 */
		setupAttributes: function() {
			this.node.setAttribute('role', 'tablist');
			this.node.setAttribute('aria-multiselectable', 'false');
		},

		/**
		 *	Adds appropriate attributes on tabs and panes.
		 */
		setupPanesAttributes: function() {
			for (var i = 0, l = this.tabs.length; i < l; i++) {
				var tab = this.tabs[i];
				var pane = this.panes[i];
				var id = tab.getAttribute('id');

				if (!id) {
					id = 'tab-' + i;
					tab.setAttribute('id', id);
				}

				tab.setAttribute('role', 'tab');
				pane.setAttribute('role', 'tabpanel');
				pane.setAttribute('aria-labelledby', id);
			}
		},

		/**
		 *	Updates appropriate attributes on related tab and pane.
		 */
		updatePanesAttributes: function() {
			for (var i = 0, l = this.panes.length; i < l; i++) {
				var tab = this.tabs[i];
				var pane = this.panes[i];
				var isActive = (pane.getAttribute('aria-expanded') === 'true');

				pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
				tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
			}
		},

		/**
		 *	Returns the index of the active tab, i.e. the one
		 *	that is currently expanded.
		 *
		 *	@return int Index.
		 */
		activeTabIndex: function() {
			for (var i = 0, l = this.tabs.length; i < l; i++) {
				if (this.tabs[i].getAttribute('aria-selected') === 'true') {
					return i;
				}
			}

			return 0;
		},

		/**
		 *	Returns the index of the focused tab.
		 *
		 *	@return int Index.
		 */
		focusedTabIndex: function() {
			for (var i = 0, l = this.tabs.length; i < l; i++) {
				if (this.tabs[i] === document.activeElement) {
					return i;
				}
			}

			return 0;
		},

		/**
		 *	Sets focus on the active tab.
		 */
		focusActiveTab: function() {
			var index = this.activeTabIndex();
			this.tabs[index].focus();
		},

		/**
		 *	Focuses on a tab next to the currently focused one.
		 *
		 *	@param int direction Direction.
		 */
		focusSiblingTab: function(direction) {
			var index = this.focusedTabIndex() + direction;

			if (index < 0) {
				index = this.tabs.length - 1;
			}

			if (index > this.tabs.length - 1) {
				index = 0;
			}

			this.tabs[index].focus();
		},

		/**
		 *	Handles keyboard navigation through the tabs.
		 *
		 *	@param object event Event.
		 */
		handleKeyDown: function(event) {
			if (event.target.getAttribute('role') !== 'tab') {
				return;
			}

			switch (event.keyCode) {
				case 37: // left
				case 38: // up
					this.focusSiblingTab(-1);
					break;

				case 39: // right
				case 40: // down
					this.focusSiblingTab(1);
					break;

				case 32: // space
					event.target.click();
					break;

				default:
					return;
			}

			event.preventDefault();
		},

		/**
		 *
		 */
		handleFocus: function(event) {
			if (
				!this.node.contains(this.focused)
				&& this.node.contains(event.target)
			) {
				this.focusActiveTab();
			}

			this.focused = event.target;
		},

		/**
		 *	Selects the tab identified by the given key.
		 *
		 *	@param string key Tab key.
		 */
		handleSelect: function(key) {
			if (key === this.state.activeKey) {
				key = null;
			}

			this.setState({
				activeKey: key
			}, function() {
				this.updatePanesAttributes();

				if (this.state.activeKey !== null) {
					this.focusActiveTab();
				}
			});

			if (this.props.onSelect) {
				this.props.onSelect(key);
			}
		},

		/**
		 *	Renders the tabbed area.
		 */
		render: function() {
			return (
				<Accordion
					activeKey={this.state.activeKey}
					onSelect={this.handleSelect}
				>
					{this.props.children}
				</Accordion>
			);
		}
	});



	/**
	 *	Modal.
	 */
	var Button = ReactBootstrap.Button;
	var Modal = ReactBootstrap.Modal;
	var OverlayMixin = root.ReactBootstrap.OverlayMixin;

	/**
	 *	Traps the focus around the component's children.
	 */
	var FocusTrap = React.createClass({

		/**
		 *	Initializes the component.
		 */
		componentDidMount: function() {
			var children = React.findDOMNode(this.refs.children);

			this.focusable = this.focusableElements(children);
			this.shiftPressed = false;

			document.addEventListener('keydown', this.handleKeyEvent);
			document.addEventListener('keyup', this.handleKeyEvent);

			this.previouslyFocused = document.activeElement;
			this.focusable[0].focus();
		},

		/**
		 *	Detaches event handlers and sets the focus back
		 *	to the element that triggered the modal.
		 */
		componentWillUnmount: function() {
			document.removeEventListener('keydown', this.handleKeyEvent);
			document.removeEventListener('keyup', this.handleKeyEvent);

			if (this.previouslyFocused) {
				this.previouslyFocused.focus();
			}
		},

		/**
		 *	Returns all focusable elements inside the given one.
		 *	It is an incomplete implementation, but good enough
		 *	for a demo.
		 *
		 *	@param object element DOM element.
		 *	@return array Focusable elements.
		 */
		focusableElements: function(element) {
			return element.querySelectorAll([
				'a[href]',
				'area[href]',
				'input:not([disabled])',
				'button:not([disabled])',
				'select:not([disabled])',
				'textarea:not([disabled])',
				'iframe',
				'object',
				'embed',
				'*[tabindex]:not([tabindex="-1"])',
				'*[contenteditable]'
			].join(', '));
		},

		/**
		 *	Stores if the shift key is currently pressed.
		 *
		 *	@param object event Keyboard event.
		 */
		handleKeyEvent: function(event) {
			this.shiftPressed = event.shiftKey;
		},

		/**
		 *	Handles focus on the modal, avoiding it beeing
		 *	lost out of it.
		 *
		 *	@param object event Event.
		 */
		handleFocus: function(event) {
			var index = this.shiftPressed
				? this.focusable.length - 1
				: 0;

			this.focusable[index].focus();
		},

		/**
		 *
		 */
		render: function() {
			return (
				<div>
					<div onFocus={this.handleFocus} tabIndex="0" />

					<div ref="children">
						{this.props.children}
					</div>

					<div onFocus={this.handleFocus} tabIndex="0" />
				</div>
			);
		}
	});

	/**
	 *	A wrapper that adds an accessibility layer to the
	 *	standard Modal.
	 *	This is done in a completely "non-React" way, as it
	 *	would require a rewrite of the components, making the
	 *	changes harder to follow.
	 */
	root.AccessibleModal = React.createClass({

		/**
		 *	Attaches event handlers and sets up the markup.
		 */
		componentDidMount: function() {
			var node = React.findDOMNode(this);
			var dialog = node.getElementsByClassName('modal-dialog')[0];
			var title = dialog.getElementsByClassName('modal-title')[0];

			dialog.setAttribute('aria-labelledby', 'modal-title');
			title.setAttribute('id', 'modal-title');
		},

		/**
		 *	Renders the modal.
		 */
		render: function() {
			return (
				<FocusTrap>
					<Modal {...this.props} backdrop="static">
						{this.props.children}
					</Modal>
				</FocusTrap>
			);
		}
	});

	/**
	 *	A simple demo container that allows to open a modal.
	 */
	root.ModalContainer = React.createClass({

		mixins: [OverlayMixin],

		getInitialState: function() {
			return {
				open: false
			};
		},

		handleToggle: function() {
			this.setState(function() {
				return {
					open: !this.state.open
				};
			});
		},

		render: function() {
			return (
				<Button onClick={this.handleToggle} bsStyle="primary">
					Ouvrir
				</Button>
			);
		},

		renderOverlay: function() {
			return this.state.open
				? this.props.overlay(this.handleToggle)
				: <span />;
		}
	});



	/**
	 *	Progress bar.
	 */
	var ProgressBar = root.ReactBootstrap.ProgressBar;

	/**
	 *	A wrapper that adds an accessibility layer to the
	 *	standard ProgressBar.
	 */
	root.LabelledProgressBar = React.createClass({

		getDefaultProps: function() {
			return {
				id: generateUid()
			};
		},

		componentDidMount: function() {
			this.updateTexts();
			this.setupTarget();
			this.updateTarget();
		},

		componentDidUpdate: function() {
			this.updateTexts();
			this.updateTarget();
		},

		/**
		 *	Adds an aria-describedby attribute on the target
		 *	element to link it to the progress bar.
		 */
		setupTarget: function() {
			if (this.props.target) {
				this.props.target.setAttribute(
					'aria-describedby',
					this.props.id
				);
			}
		},

		/**
		 *	Adds an aria-busy attribute on the target element
		 *	to tell if it is currently updating.
		 */
		updateTarget: function() {
			if (!this.props.target) {
				return;
			}

			var min = this.props.min || 0;
			var max = this.props.max || 100;
			var busy = (this.props.now > min) && (this.props.now < max);

			this.props.target.setAttribute('aria-busy', busy);
		},

		/**
		 *	Updates the valuetext property of the children
		 *	progress bars.
		 */
		updateTexts: function() {
			var node = React.findDOMNode(this.refs.progress);
			var children = node.childNodes;

			for (var i = 0, l = children.length; i < l; i++) {
				this.updateText(children[i]);
			}
		},

		/**
		 *	Updates the valuetext property of the given node.
		 *
		 *	@param object node Node.
		 */
		updateText: function(node) {
			var text = ('textContent' in node)
				? node.textContent
				: node.innerText;

			node.setAttribute('aria-valuetext', text);
		},

		/**
		 *	Renders the progress bar.
		 */
		render: function() {
			return <ProgressBar {...this.props} ref="progress" />;
		}
	});

	/**
	 *	A simple demo container that updates it's child progress bar.
	 */
	root.ProgressBarContainer = React.createClass({

		getInitialState: function() {
			return {
				value: 0
			};
		},

		start: function() {
			this.setState({
				value: 0
			}, function() {
				clearInterval(this.interval);
				this.interval = setInterval(this.update, 100);
			});
		},

		update: function() {
			var value = this.state.value + 5;

			this.setState({
				value: value
			}, function() {
				if (this.state.value >= 100) {
					clearInterval(this.interval);
				}
			});
		},

		render: function() {
			return (
				<div>
					{this.renderProgressBar()}

					<button
						type="button"
						className="btn btn-sm btn-primary"
						onClick={this.start}
					>
						Démarrer
					</button>
				</div>
			);
		},

		renderProgressBar: function() {
			var progressBar = React.Children.only(this.props.children);

			return React.cloneElement(progressBar, {
				now: this.state.value
			});
		}
	});



	/**
	 *	Tabs.
	 */
	var TabbedArea = root.ReactBootstrap.TabbedArea;

	/**
	 *	A wrapper that adds an accessibility layer to the
	 *	standard TabbedArea.
	 *	This is done in a completely "non-React" way, as it
	 *	would require a rewrite of the components, making the
	 *	changes harder to follow.
	 */
	root.AccessibleTabbedArea = React.createClass({

		/**
		 *	Returns the initial state.
		 *
		 *	@return object State.
		 */
		getInitialState: function() {
			return {
				activeKey: this.props.defaultActiveKey || null
			};
		},

		/**
		 *	Attaches event handlers and sets up the markup.
		 */
		componentDidMount: function() {
			this.tabList = React.findDOMNode(this.refs.area.refs.tabs);
			this.tabs = this.tabList.getElementsByTagName('a');

			this.paneList = React.findDOMNode(this.refs.area.refs.panes);
			this.panes = this.paneList.children;

			this.tabList.addEventListener('keydown', this.handleKeyDown);

			this.setupAttributes();
			this.updateAttributes();
		},

		/**
		 *	Detaches event handlers.
		 */
		componentWillUnmount: function() {
			this.tabList.removeEventListener('keydown', this.handleKeyDown);
		},

		/**
		 *	Sets up appropriate roles and ids on the elements.
		 */
		setupAttributes: function() {
			this.tabList.setAttribute('role', 'tablist');

			for (var i = 0, l = this.panes.length; i < l; i++) {
				var tab = this.tabs[i];
				var pane = this.panes[i];
				var id = pane.getAttribute('id');

				if (!id) {
					id = 'pane-' + i;
					pane.setAttribute('id', id);
				}

				tab.setAttribute('aria-controls', id);
				tab.setAttribute('role', 'tab');
				pane.setAttribute('role', 'tabpanel');
			}
		},

		/**
		 *	Activates a tab, thus disabling the other ones.
		 */
		updateAttributes: function() {
			var ref = 'tab' + this.state.activeKey;
			var active = React.findDOMNode(this.refs.area.refs[ref].refs.anchor);

			for (var i = 0, l = this.tabs.length; i < l; i++) {
				var tab = this.tabs[i];
				var isActive = (tab === active);

				tab.setAttribute('tabindex', isActive ? 0 : -1)
				tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
			}
		},

		/**
		 *	Sets focus on the active tab.
		 */
		focusActiveTab: function() {
			var ref = 'tab' + this.state.activeKey;
			var active = React.findDOMNode(this.refs.area.refs[ref].refs.anchor);

			active.focus();
		},

		/**
		 *	Handles keyboard navigation through the tabs.
		 *
		 *	@param object event Event.
		 */
		handleKeyDown: function(event) {
			var ref = 'tab' + this.refs.area.getActiveKey();
			var node = React.findDOMNode(this.refs.area.refs[ref]);
			var next;

			switch (event.keyCode) {
				case 37: // left
				case 38: // up
					next = node.previousElementSibling || node.parentElement.lastChild;
					break;

				case 39: // right
				case 40: // down
					next = node.nextElementSibling || node.parentElement.firstChild;
					break;

				default:
					return;
			}

			event.preventDefault();
			next.firstElementChild.click();
		},

		/**
		 *	Selects the tab identified by the given key.
		 *
		 *	@param string key Tab key.
		 */
		handleSelect: function(key) {
			this.setState({
				activeKey: key
			}, function() {
				this.updateAttributes();
				this.focusActiveTab();
			});

			if (this.props.onSelect) {
				this.props.onSelect(key);
			}
		},

		/**
		 *	Renders the tabbed area.
		 */
		render: function() {
			return (
				<TabbedArea
					ref="area"
					activeKey={this.state.activeKey}
					onSelect={this.handleSelect}
				>
					{this.props.children}
				</TabbedArea>
			);
		}
	});



	/**
	 *	Tooltip.
	 */
	var OverlayTrigger = root.ReactBootstrap.OverlayTrigger;

	/**
	 *	A specialized OverlayTrigger that adds an accessibility
	 *	layer to the standard tooltips.
	 */
	root.TooltipOverlayTrigger = React.createClass({

		/**
		 *	Returns the tooltip id, or generate a unique
		 *	one if none was set.
		 *
		 *	@return int id.
		 */
		tooltipId: function() {
			return this.props.overlay.props.id
				? this.props.overlay.props.id
				: 'tooltip-' + generateUid();
		},

		/**
		 *	Closes the tooltip when the user presses esc.
		 *
		 *	@param object event Event.
		 */
		handleKeyDown: function(event) {
			if (event.keyCode === 27) {
				this.refs.trigger.handleDelayedHide();
			}

			if (this.props.onKeyDown) {
				this.props.onKeyDown(event);
			}
		},

		/**
		 *	Renders the overlay and the tooltip with all the
		 *	required attributes and handlers.
		 */
		render: function() {
			var id = this.tooltipId();
			var child = this.renderChild(id);
			var tooltip = this.renderTooltip(id);

			return (
				<OverlayTrigger {...this.props} ref="trigger" overlay={tooltip}>
					{child}
				</OverlayTrigger>
			);
		},

		/**
		 *	Renders the enriched tooltip.
		 */
		renderTooltip: function(id) {
			return React.cloneElement(this.props.overlay, {
				id: id,
				role: 'tooltip'
			});
		},

		/**
		 *	Renders the enriched child.
		 */
		renderChild: function(tooltipId) {
			var child = React.Children.only(this.props.children);

			return React.cloneElement(child, {
				'aria-describedby': tooltipId,
				'onKeyDown': this.handleKeyDown
			});
		}
	});
}(window));
