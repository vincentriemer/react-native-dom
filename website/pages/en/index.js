/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const Iframe = require("react-iframe").default;
const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + "/siteConfig.js");

const layoutAnimationSource = `import React from "react";
import {
  NativeModules,
  LayoutAnimation,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  AppRegistry,
} from "react-native";

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

class App extends React.Component {
  state = {
    w: 100,
    h: 100,
  };

  _onPress = () => {
    // Animate the update
    LayoutAnimation.spring();
    this.setState({ w: this.state.w + 15, h: this.state.h + 15 });
  };

  render() {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.box,
            {
              width: this.state.w,
              height: this.state.h,
            },
          ]}
        />
        <TouchableOpacity onPress={this._onPress}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Press me!</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: 200,
    height: 200,
    backgroundColor: "red",
  },
  button: {
    backgroundColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

AppRegistry.registerComponent("App", () => App);`;

function imgUrl(img) {
  return siteConfig.baseUrl + "img/" + img;
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + "docs/" + (language ? language + "/" : "") + doc;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + "/" : "") + page;
}

class LiveExample extends React.Component {
  render() {
    const { source } = this.props;

    const frameURL = source
      ? `https://player.rndom.app/#code=${encodeURIComponent(source)}`
      : "https://player.rndom.app";

    return <Iframe url={frameURL} width="100%" height="500px" />;
  }
}

class ExampleBlock extends React.Component {
  render() {
    const { title, content, source, background } = this.props;
    return (
      <Container padding={["bottom"]} background={background}>
        <div style={{}} className="wrapper">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="blockContent exampleContent">
              <h2>{title}</h2>
              <MarkdownBlock>{content}</MarkdownBlock>
            </div>
            <div style={{ position: "relative", height: 500 }}>
              <LiveExample source={source} />
            </div>
          </div>
        </div>
      </Container>
    );
  }
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: "_self"
};

const SplashContainer = (props) => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = (props) => (
  <div className="projectLogo">
    <img src={props.img_src} />
  </div>
);

const ProjectTitle = (props) => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
);

const PromoSection = (props) => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || "";
    return (
      <SplashContainer>
        <Logo img_src={imgUrl("rn-dom-logo-large.svg")} />
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href={docUrl("doc1.html", language)}>Get Started</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Block = (props) => (
  <Container padding={["bottom"]} id={props.id} background={props.background}>
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
);

const Features = (props) => (
  <Block layout="fourColumn">
    {[
      {
        content:
          "Following the same multithreaded bridge architecture as React Native, all of your components/app logic are run in a web worker, leaving the main thread to entirely focus on rendering.",
        image: imgUrl("react-native-logo@svg.svg"),
        imageAlign: "top",
        title: "Architecture"
      },
      {
        content:
          "Powered by custom bindings to Yoga and compiled to Web Assembly, avoid layout inconsistencies between your native and web projects.",
        image: imgUrl("yoga.svg"),
        imageAlign: "top",
        title: "Layout"
      },
      {
        content:
          "Keep the same developer experience as you do on Native by building your bundles with Metro.",
        image: imgUrl("metro.svg"),
        imageAlign: "top",
        title: "Build"
      }
    ]}
  </Block>
);

const FeatureCallout = (props) => (
  <div
    className="productShowcaseSection"
    style={{ textAlign: "center", paddingBottom: 60 }}
  >
    <h2>React Native's Entire Stack on the Web</h2>
  </div>
);

const LearnHow = (props) => (
  <Block background="light">
    {[
      {
        content: "Talk about learning how to use this",
        image: imgUrl("rn-dom-logo-large.svg"),
        imageAlign: "right",
        title: "Learn How"
      }
    ]}
  </Block>
);

const TryOut = (props) => (
  <Block id="try">
    {[
      {
        content: "Talk about trying this out",
        image: imgUrl("rn-dom-logo-large.svg"),
        imageAlign: "left",
        title: "Try it Out"
      }
    ]}
  </Block>
);

const Description = (props) => (
  <Block background="dark">
    {[
      {
        content: "This is another description of how this project is useful",
        image: imgUrl("rn-dom-logo-large.svg"),
        imageAlign: "right",
        title: "Description"
      }
    ]}
  </Block>
);

const Showcase = (props) => {
  if ((siteConfig.users || []).length === 0) {
    return null;
  }
  const showcase = siteConfig.users
    .filter((user) => {
      return user.pinned;
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} alt={user.caption} title={user.caption} />
        </a>
      );
    });

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>{"Who's Using This?"}</h2>
      <p>This project is used by all these people</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl("users.html", props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  );
};

class Index extends React.Component {
  render() {
    let language = this.props.language || "";

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features />
          <ExampleBlock
            title="It's Just React Native"
            content="Lorem ipsum dolor amet mlkshk irony iPhone venmo leggings kale chips bushwick palo santo letterpress. Try-hard shaman iPhone mlkshk. Freegan pour-over poutine ugh. Mumblecore brunch PBR&B prism affogato try-hard occupy next level tumeric edison bulb ethical etsy everyday carry. Ugh chambray meditation kinfolk hot chicken jean shorts."
          />
          <ExampleBlock
            title="Full API Support"
            content="Lorem ipsum dolor amet mlkshk irony iPhone venmo leggings kale chips bushwick palo santo letterpress. Try-hard shaman iPhone mlkshk. Freegan pour-over poutine ugh. Mumblecore brunch PBR&B prism affogato try-hard occupy next level tumeric edison bulb ethical etsy everyday carry. Ugh chambray meditation kinfolk hot chicken jean shorts."
            source={layoutAnimationSource}
          />
          {/* <LearnHow />
          <TryOut />
          <Description /> */}
          {/* <Showcase language={language} /> */}
        </div>
      </div>
    );
  }
}

module.exports = Index;
