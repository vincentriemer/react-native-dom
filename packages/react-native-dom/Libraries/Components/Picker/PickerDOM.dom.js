/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule PickerDOM
 *
 * This is a controlled component version of RCTPickerDOM
 */
"use strict";

const ColorPropType = require("ColorPropType");
const NativeMethodsMixin = require("NativeMethodsMixin");
const React = require("React");
const PropTypes = require("prop-types");
const StyleSheet = require("StyleSheet");
const StyleSheetPropType = require("StyleSheetPropType");
const TextStylePropTypes = require("TextStylePropTypes");
const View = require("View");
const ViewPropTypes = require("ViewPropTypes");
const ViewStylePropTypes = require("ViewStylePropTypes");
const processColor = require("processColor");

const createReactClass = require("create-react-class");
const requireNativeComponent = require("requireNativeComponent");

const pickerStyleType = StyleSheetPropType({
  ...ViewStylePropTypes,
  color: ColorPropType
});

const PickerDOM = createReactClass({
  displayName: "PickerDOM",
  mixins: [NativeMethodsMixin],

  propTypes: {
    ...ViewPropTypes,
    style: pickerStyleType,
    selectedValue: PropTypes.any,
    enabled: PropTypes.bool,
    onValueChange: PropTypes.func,
    selectedValue: PropTypes.any // string or integer basically
  },

  getInitialState: function() {
    return this._stateFromProps(this.props);
  },

  UNSAFE_componentWillReceiveProps: function(nextProps) {
    this.setState(this._stateFromProps(nextProps));
  },

  // Translate PickerDOM prop and children into stuff that RCTPickerDOM understands.
  _stateFromProps: function(props) {
    let selectedIndex = 0;
    const items = [];
    React.Children.toArray(props.children).forEach(function(child, index) {
      if (child.props.value === props.selectedValue) {
        selectedIndex = index;
      }
      items.push({
        value: child.props.value,
        label: child.props.label,
        textColor: processColor(child.props.color)
      });
    });
    return { selectedIndex, items };
  },

  render: function() {
    return (
      <RCTPickerDOM
        ref={(picker) => (this._picker = picker)}
        style={[styles.pickerDOM, this.props.style]}
        items={this.state.items}
        selectedIndex={this.state.selectedIndex}
        onChange={this._onChange}
        enabled={this.props.enabled}
      />
    );
  },

  _onChange: function(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    if (this.props.onValueChange) {
      this.props.onValueChange(
        event.nativeEvent.newValue,
        event.nativeEvent.newIndex
      );
    }

    // The picker is a controlled component. This means we expect the
    // on*Change handlers to be in charge of updating our
    // `selectedValue` prop. That way they can also
    // disallow/undo/mutate the selection of certain values. In other
    // words, the embedder of this component should be the source of
    // truth, not the native component.
    if (
      this._picker &&
      this.state.selectedIndex !== event.nativeEvent.newIndex
    ) {
      this._picker.setNativeProps({
        selectedIndex: this.state.selectedIndex
      });
    }
  }
});

PickerDOM.Item = class extends React.Component {
  static propTypes = {
    value: PropTypes.any, // string or integer basically
    label: PropTypes.string,
    color: PropTypes.string
  };

  render() {
    // These items don't get rendered directly.
    return null;
  }
};

const styles = StyleSheet.create({
  pickerDOM: {
    // The picker will conform to whatever width is given, but we do
    // have to set the component's height explicitly on the
    // surrounding view to ensure it gets rendered.
    height: 38
  }
});

const RCTPickerDOM = requireNativeComponent(
  "RCTPicker",
  {
    propTypes: {
      ...ViewPropTypes,
      style: pickerStyleType
    }
  },
  {
    nativeOnly: {
      items: true,
      onChange: true,
      selectedIndex: true,
      enabled: true
    }
  }
);

module.exports = PickerDOM;
