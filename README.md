# Scaffold AngularJS app

Clone this repo to get quick start of your AngularJS application which can use component libraries.

It uses [YABL](YABL.md) to get things integrated.

Interesting commands:

* `grunt build` - prepare components in the `dist/` dir for distribution
* `grunt serve` - start the app (livereload included)
* `grunt serve:browserSync` - same with browserSync
* `grunt release` - bump version number, build and commit to git repo with version tag
* `grunt release:minor` - same, bump minor version number (like 0.1.0)
* `grunt release:major` - same, bump major version number (like 1.0.0), other options are: premajor, preminor, prepatch, prerelease, zero

## Folders layout

Sources are placed under the `app/` folder:

```
app/
app/scripts
app/images
app/styles
app/views
```

Bower dependencies are injected into index.html by wiredep. 

Less styles from `app/styles/main.less` are compiled to CSS, all used CSS files are autoprefixed and concatenated to `dist/styles/main.css`.
 
Scripts are linted with ESLint. All used scripts are concatenated, ngAnnotated and uglified into `dist/scripts/index.js`.

All assets from `bower_componets/*/dist` are assembled under `dist/` folder, together with the `app/` folder copied over it.

All files in `dist/` get minified and hash-named when appropriate using common best practices (see generator-angular). 

## Safe release procedure

Following procedure is implemented by `grunt release` task:

1. Check there are no uncommitted changes.
2. Bump version number
2. Run `build` task
5. Update manifest files (package.json, bower.json)
6. Commit changes
7. Tag commit
9. Push changes & tag to the repo

Still, things can go wrong if bower.json doesn't have all the required dependencies and they are injected manually into demo app for testing.
 
It makes sense to prepare full build first and test it before producing important release:

```sh
rm -rf node_modules && npm install
rm -rf bower_components && bower install
grunt serve
```

and release after build is tested.
