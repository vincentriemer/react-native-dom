"use strict";

const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const template = require("babel-template");
const generate = require("babel-generator").default;
const t = require("babel-types");

const platformsArrayVisitor = {
  ArrayExpression(path) {
    if (
      !path.node.elements.some(function(elem) {
        return elem.value === "dom";
      })
    ) {
      path.replaceWith(
        t.arrayExpression(path.node.elements.concat([t.stringLiteral("dom")]))
      );
    }
  }
};

const providesModulesVisitor = {
  ArrayExpression(path) {
    if (
      !path.node.elements.some(function(elem) {
        return elem.value === "react-native-dom";
      })
    ) {
      path.replaceWith(
        t.arrayExpression(
          path.node.elements.concat([t.stringLiteral("react-native-dom")])
        )
      );
    }
  }
};

const configObjectVisitor = {
  Identifier(path) {
    if (path.node.name === "getPlatforms") {
      path.parentPath.traverse(platformsArrayVisitor);
      this.hasPlatforms = true;
    }

    if (path.node.name === "getProvidesModuleNodeModules") {
      path.parentPath.traverse(providesModulesVisitor);
      this.hasProvidesNodeModules = true;
    }
  }
};

function traverseConfigObject(path) {
  const configState = {
    hasPlatforms: false,
    hasProvidesNodeModules: false
  };

  path.traverse(configObjectVisitor, configState);

  let objNode = (function() {
    if (path.node.properties != null) {
      return path.node;
    } else if (path.node.init.properties != null) {
      return path.node.init;
    }
  })();

  if (!configState.hasPlatforms) {
    objNode.properties.push(
      t.objectMethod(
        "method",
        t.identifier("getPlatforms"),
        [],
        template(`{ return ["dom"]; }`)()
      )
    );
  }

  if (!configState.hasProvidesNodeModules) {
    objNode.properties.push(
      t.objectMethod(
        "method",
        t.identifier("getProvidesModuleNodeModules"),
        [],
        template(`{ return ["react-native", "react-native-dom"]; }`)()
      )
    );
  }
}

const exportsAssignmentVisitor = {
  ObjectExpression(path) {
    if (path.parentPath.scope.uid === this.exportsAssignmentId) {
      traverseConfigObject(path);
    }
  },
  Identifier(path, state) {
    if (
      path.parentPath.scope.uid === this.exportsAssignmentId &&
      !["module", "exports"].includes(path.node.name)
    ) {
      const referencePath = path.scope.getBinding(path.node.name);
      if (!referencePath) return;

      traverseConfigObject(referencePath.path);
    }
  }
};

const exportsVisitor = {
  AssignmentExpression(path) {
    if (
      path.node.left.type === "MemberExpression" &&
      path.node.left.property.type === "Identifier" &&
      path.node.left.property.name === "exports"
    ) {
      path.scope.generateUidIdentifier("uid");
      path.traverse(exportsAssignmentVisitor, {
        exportsAssignmentId: path.scope.uid
      });
    }
  }
};

module.exports = function(code) {
  const ast = babylon.parse(code, {
    sourceType: "module"
  });

  traverse(ast, exportsVisitor);

  const res = generate(ast, {}, code);
  return res.code;
};
