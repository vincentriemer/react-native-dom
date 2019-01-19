workflow "Continuous Integration" {
  on = "push"
  resolves = ["Build RNTester"]
}

action "Dependencies" {
  uses = "aquariuslt/github-actions-yarn@master"
  runs = "yarn"
  args = "install --frozen-lockfile"
}

action "Unit Tests" {
  uses = "aquariuslt/github-actions-yarn@master"
  needs = ["Dependencies"]
  runs = "yarn"
  args = "test"
}

action "Build Components" {
  uses = "aquariuslt/github-actions-yarn@master"
  needs = ["Unit Tests"]
  runs = "yarn"
  args = "compile:components"
}

action "Lint" {
  uses = "aquariuslt/github-actions-yarn@master"
  needs = ["Build Components"]
  runs = "yarn"
  args = "lint"
}

action "Build React Native DOM" {
  uses = "aquariuslt/github-actions-yarn@master"
  needs = ["Lint"]
  runs = "yarn"
  args = "compile:rndom"
}

action "Build RNTester" {
  uses = "aquariuslt/github-actions-yarn@master"
  needs = ["Build React Native DOM"]
  runs = "yarn"
  args = "build:rntester"
}