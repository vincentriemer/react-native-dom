workflow "Continuous Integration" {
  on = "push"
  resolves = [
    "Build RNTester",
    "new-action",
  ]
}

action "Update Submodules" {
  uses = "./actions/git"
  args = "submodule update --init"
}

action "Dependencies" {
  uses = "./actions/yarn"
  needs = ["Update Submodules"]
  args = "install --frozen-lockfile"
}

action "Lint" {
  uses = "./actions/yarn"
  needs = ["Dependencies"]
  args = "lint"
}

action "Unit Tests" {
  uses = "./actions/yarn"
  needs = ["Dependencies"]
  args = "test"
}

action "Build React Native DOM" {
  uses = "./actions/yarn"
  needs = ["Unit Tests", "Lint"]
  args = "compile:rndom"
}

action "Build Components" {
  uses = "./actions/yarn"
  needs = ["Unit Tests", "Lint"]
  args = "compile:components"
}

action "Build RNTester" {
  uses = "./actions/yarn"
  needs = ["Build Components", "Build React Native DOM"]
  args = "build:rntester"
}

action "new-action" {
  uses = "owner/repo/path@ref"
  needs = ["Dependencies"]
}