### Update the `RNTester` branch

The same example apps from `react-native` are also available for
`react-native-dom`, including the
[RNTester](https://github.com/facebook/react-native/tree/master/Examples/UIExplorer).

We maintain a fork of the `RNTester` folder from `react-native` as a submodule
of `react-native-dom`. The fork uses `git filter-branch` to produce a branch of
`react-native` that includes only the content of the Examples folder. We then
merge all the changes specific to `react-native-dom` with that filtered branch.

```bash
# Be sure that you have all submodules initialized and up-to-date for react-native-dom.
cd RNTester

# If you don't already have facebook/react-native set up as a Git remote...
git remote add facebook git@github.com:facebook/react-native

# Fetch the latest from facebook
git fetch facebook

# Create a new branch to run the `filter-branch` command only
git checkout -b fbmaster facebook/master

# Filter the react-native master branch for Examples only, this will take some time
# You may have to use `-f` if you've previously run a `filter-branch` command
git filter-branch --prune-empty --subdirectory-filter RNTester fbmaster

# Fetch the latest from react-native-dom
git fetch origin

# Create a new staging branch to perform a merge onto the react-native-dom `examples` branch
git checkout -b staging origin/rntester

# Merge the latest from facebook/react-native RNTester and resolve any merge conflicts
git merge fbmaster

# Fast-forward the `rntester` branch from the `staging` branch
# Before doing this, it's probably a good idea to test that the examples are working by running them
# If anything has broken (it's common), fix it
git checkout rntester
git merge staging

# Use the RNTester to test changes before pushing to react-native-dom

# Push (or PR) your changes to react-native-dom
git push origin rntester

# Cleanup your staging branches
git branch -D fbmaster
git branch -D staging
```
