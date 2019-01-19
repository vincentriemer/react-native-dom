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

action "Build React Native DOM" {
  uses = "aquariuslt/github-actions-yarn@master"
  needs = ["Unit Tests"]
  runs = "yarn"
  args = "compile:rndom"
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

action "Build RNTester" {
  uses = "aquariuslt/github-actions-yarn@master"
  needs = ["Build Components", "Build React Native DOM", "Lint"]
  runs = "yarn"
  args = "build:rntester"
}