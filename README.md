# grunt-ver

A [Grunt](https://github.com/cowboy/grunt) 0.4 [multi-task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md) that does 3 things:

1. Renames files in-place to contain a version tag that a hash of the file contents.

2. (optional) Updates references to the renamed files inside other files.  Replacement is done in-place by searching
for the original filepath (e.g. 'static/images/logo.png') and replacing it by the versioned basename
(e.g. 'static/images/logo.abc123.png').  You can specify which files to replace over using the 'references' option.

3. (optional) Writes a json file containing the file rename information.  This is meant to be consumed by an external application.  For example, in a web application, you could read this file and emit a `<script>` tag that referenes a renamed .js file.  The contents of this file look something like:

```
{ "foo.js": "foo.d41d8cd9.js",
  "foo.png": "foo.d41d8cd9.png",
  "foo.css": "foo.8967dedd.css" }
```

Versioning and replacements are done in one or more 'phases'.  This is necessary when you update file
references inside of files that also need to be versioned.  For example: CSS files refer to versioned
image files, but the CSS files themselves need to be versioned.  The CSS files cannot be versioned
until the references have been updated because the version hash calculation depends on the file contents being
finalized.

## Breaking Changes from < 0.5

If you're upgrading from a version < 0.5 to a version >= 0.5, please node that the algorithm for updating references has changed.  In versions < 0.5, the find/replace was based only on the basename of the file ("logo.png").  As of 0.5, the replacement is done based on the filepath ("static/images/logo.png").

## Getting Started
Install the module with: `npm install grunt-ver`

Then load it from your `grunt.js` file:

```js
grunt.loadNpmTasks('grunt-ver');
```

In your `grunt.js` file, add the follow task entry:

```js
version: {
  myapp: {
    phases: [
      {
        files: [
          'images/*.png'
        ],
        references: [
          'css/*.css'
        ]
      },
      {
        files: [
          'css/*.css',
          'js/*.js'
        ]
      }
    ],
    versionFile: 'build/version.json'
  }
}
```

After the task is run, all files will have version tags, the CSS files will refer to the versioned images, and build/version.json will exist.

## Options

### forceVersion

Type: `String`
Optional

You can force the version string to all files to a particular value using the forceversion option.  This is useful for development environments where stable file names are helpful for debugging and where cache busting isn't an issue.

```js
version: {
  myapp: {
    forceVersion: "dev",
    phases: [
      {
        files: [
          'css/*.css',
          'js/*.js'
        ]
      }
    ],
    versionFile: 'build/version.json'
  }
}
```

### baseDir

Type: `String`
Default: The directory of versionFile

All file paths inside of `versionFile` will be relative to `baseDir`.


## Release History
* 2014-02-06 0.5.0  When updating references, find/replace longer filepaths instead of shorter basenames.  Using the old `version` option now generates a warning.
* 2014-02-03 0.3.0  Added `baseDir` option.  Filepaths in versionFile are now relative to the directory of the versionFile.  The `version` option was renamed to `versionFile`.

## License
Copyright (c) 2014 Chris Danford
Licensed under the MIT license.



