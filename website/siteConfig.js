/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

/* List of projects/orgs using your project for the users page */
const users = [
  // {
  //   caption: 'User1',
  //   // You will need to prepend the image path with your baseUrl
  //   // if it is not '/', like: '/test-site/img/docusaurus.svg'.
  //   image: '/img/docusaurus.svg',
  //   infoLink: 'https://www.facebook.com',
  //   pinned: true,
  // },
];

const siteConfig = {
  title: "React Native DOM" /* title for your website */,
  tagline: "An experimental, comprehensive port of React Native to the web.",
  url: "https://react-native-dom.js.org" /* your website url */,
  baseUrl: "/" /* base url for your project */,
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: "react-native-dom",
  organizationName: "vincentriemer",
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: "doc1", label: "Docs" },
    // { doc: "doc4", label: "API" },
    { page: "help", label: "Help" },
    // { search: true },
    {
      href: "https://github.com/vincentriemer/react-native-dom",
      label: "GitHub"
    },
    {
      href: "https://facebook.github.io/react-native/",
      label: "React Native"
    }
    // { blog: true, label: "Blog" }
  ],

  // If you have users set above, you add it here:
  // users,

  /* path to images for header/footer */
  headerIcon: "img/rn-dom-logo.svg",
  footerIcon: "img/rn-dom-logo.svg",
  favicon: "img/rn-dom-logo-favicon.png",

  /* colors for website */
  colors: {
    primaryColor: "#20232A",
    secondaryColor: "#3A3249",
    backgroundColor: "#282C34",
    tintColor: "#D063FB",
    textInvert: "#FFFFFF"
  },

  /* custom fonts for website */
  /*fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },*/

  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright: "Copyright © " + new Date().getFullYear() + " Vincent Riemer",

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: "atom-one-dark",
    // themeUrl: "/css/rndom-hjs.css",
    usePrism: ["js", "jsx"]
  },

  // Add custom scripts here that would be placed in <script> tags
  scripts: ["https://buttons.github.io/buttons.js"],

  /* On page navigation for the current documentation page */
  onPageNav: "separate",

  /* Open Graph and Twitter card images */
  ogImage: "img/docusaurus.png",
  twitterImage: "img/docusaurus.png",

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
  repoUrl: "https://github.com/vincentriemer/react-native-dom",
  twitter: true
};

module.exports = siteConfig;
