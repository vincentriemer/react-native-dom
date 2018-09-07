const fs = require("fs");
const template = require("@babel/template").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const { NATIVE_MODULE_IDENT } = require("../../constants");

const buildModule = template(
  `
const ${NATIVE_MODULE_IDENT} = SOURCE_ARRAY;
export default ${NATIVE_MODULE_IDENT};
`,
  {
    placeholderPattern: /^SOURCE_ARRAY$/
  }
);

function buildSourceArray(dependencyConfig) {
  const elements = [];
  for (let depName in dependencyConfig) {
    const requirePath = dependencyConfig[depName];
    elements.push(template.expression(`require("${requirePath}")`)());
  }
  return t.arrayExpression(elements);
}

module.exports = function updateVendorModule(
  dependencyConfig,
  vendorModulePath
) {
  const sourceArray = buildSourceArray(dependencyConfig);

  const ast = buildModule({
    SOURCE_ARRAY: sourceArray
  });
  const code = generate(t.program(ast)).code;

  fs.writeFileSync(vendorModulePath, code);
};
