/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ScrollViewStickyHeader
 * @flow
 * @format
 */
"use strict";

const AnimatedImplementation = require("AnimatedImplementation");
const React = require("React");
const StyleSheet = require("StyleSheet");
const View = require("View");

import type { LayoutEvent } from "CoreEventTypes";

type Props = {
  children?: React.Element<any>,
  nextHeaderLayoutY: ?number,
  onLayout: (event: LayoutEvent) => void,
  scrollAnimatedValue: AnimatedImplementation.Value,
  // Will cause sticky headers to stick at the bottom of the ScrollView instead
  // of the top.
  inverted: ?boolean,
  // The height of the parent ScrollView. Currently only set when inverted.
  scrollViewHeight: ?number
};

type State = {};

class ScrollViewStickyHeader extends React.Component<Props, State> {
  state = {};

  render() {
    const { inverted, scrollViewHeight } = this.props;

    const child = React.Children.only(this.props.children);

    return (
      <View collapsable={false} style={[child.props.style, styles.header]}>
        {React.cloneElement(child, {
          style: styles.fill, // We transfer the child style to the wrapper.
          onLayout: undefined // we call this manually through our this._onLayout
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    zIndex: 10
  },
  fill: {
    flex: 1
  }
});

module.exports = ScrollViewStickyHeader;
