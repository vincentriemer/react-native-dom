const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const generateBundles = (loc) => {
    const source = path.resolve(loc, "../")
    copyFiles(source, loc)
    editFiles(loc);
    executeBundleCommands(loc);
    clearBundleFiles(loc);
}

const cleanDistFolder = (loc) => {
    const files = fs.readdirSync(loc);
    console.log(`cleaning ${chalk.yellow(loc.substring(loc.lastIndexOf("/")))} folder`)
    for (const file of files) {
        let stats = fs.statSync(`${loc}/${file}`);
        if (stats.isDirectory()) {
            cleanDistFolder(`${loc}/${file}`)
        } else {
            fs.unlinkSync(`${loc}/${file}`);
        }
    }
}

const copyFiles = (source, dest) => {
    console.log(`copying files from ${chalk.yellow("dom")} folder to ${chalk.yellow("dist")} folder`)
    const files = fs.readdirSync(source);
    for (const file of files) {
        if (file !== "dist") {
            fs.copyFileSync(`${source}/${file}`, `${dest}/${file}`);
        }
    }
}

const editFiles = (loc) => {
    const files = fs.readdirSync(loc);
    console.log(`preparing files for bundling`);
    for (const file of files) {
        let stats = fs.statSync(`${loc}/${file}`);
        if (stats.isDirectory()) {
            editFiles(`${loc}/${file}`)
        } else {
            let data = fs.readFileSync(`${loc}/${file}`, 'utf-8');
            data = data.replace(/.bundle/g, ".bundle.js");
            fs.writeFileSync(`${loc}/${file}`, data, 'utf-8');
        }
    }
}

const executeBundleCommands = (loc) => {
    const bootstrapEntry = `${loc}/bootstrap.js`;
    const bootstrapBundle = `${loc}/bootstrap.bundle.js`;
    const appEntry = `${loc}/entry.js`;
    const appBundle = `${loc}/entry.bundle.js`;
    console.log(`bundling ${chalk.yellow("bootstrap.js")}`);
    execSync(`react-native bundle --dev false --platform dom --entry-file ${bootstrapEntry} --bundle-output ${bootstrapBundle} --assets-dest ${loc}`);
    console.log(`bundling ${chalk.green("bootstrap.js")} complete`);
    console.log(`bundling ${chalk.yellow("entry.js")}`);
    execSync(`react-native bundle --dev false --platform dom --entry-file ${appEntry} --bundle-output ${appBundle} --assets-dest ${loc}`);
    console.log(`bundling ${chalk.green("entry.js")} complete`);
}

const clearBundleFiles = (loc) => {
    console.log(`getting bundle ready for deployment`);
    const files = fs.readdirSync(loc);
    for (const file of files) {
        if (file !== "assets" && !file.match("bundle.js") && !file.match("index.html")) {
            fs.unlinkSync(`${loc}/${file}`);
        }
    }
}
const initiateBundling = () => {
    const distLoc = `${process.cwd()}/dom/dist`;
    if (!fs.existsSync(distLoc)) {
        console.log(`creating dist directory at location ${chalk.green(distLoc)}`);
        fs.mkdirSync(distLoc);
    } else {
        cleanDistFolder(distLoc);
    }
    generateBundles(distLoc)
    console.log(chalk.green(`bundling completed`));
};

function buildDom(){
    process.env.NODE_ENV="production";
    initiateBundling();
}

module.exports = {
    name: "build-dom",
    description: "bundles app and dom native code for deployment",
    func: buildDom
};