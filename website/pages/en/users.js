/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const Container = CompLibrary.Container;

const siteConfig = require(process.cwd() + "/siteConfig.js");

class Users extends React.Component {
  render() {
    // if ((siteConfig.users || []).length === 0) {
    //   return null;
    // }
    const editUrl = siteConfig.repoUrl + "/edit/master/website/siteConfig.js";
    const showcase = !!siteConfig.users.length
      ? siteConfig.users.map((user, i) => {
          return (
            <a href={user.infoLink} key={i}>
              <img src={user.image} title={user.caption} />
            </a>
          );
        })
      : [<p key="lol-no">Nobody is actually using this 😬</p>];

    return (
      <div className="mainContainer">
        <Container padding={["bottom", "top"]}>
          <div className="showcaseSection">
            <div className="prose">
              <h1>Who's Using This?</h1>
            </div>
            <div className="logos">{showcase}</div>
            <div className="prose" style={{ paddingTop: 66 }}>
              <p>Are you using this project?</p>
              <a
                href="https://github.com/vincentriemer/react-native-dom/edit/master/website/siteConfig.js"
                className="button"
              >
                Add your company
              </a>
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Users;
