# grunt-ver

**0.1.x was the last version of this plugin that supported Grunt 0.3.x.**

A [Grunt](https://github.com/cowboy/grunt) 0.4 [multi-task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md) that does 3 things:

1. Renames files in-place to add a version tag that a hash of the contents.

2. (optional) Updates references to the renamed files.  Replacement is done in-place using
a naive find/replace of the original basename of the file (e.g. 'logo.png') to the versioned basename
(e.g. 'logo.abc123.png').  You can specify which files to replace over via the 'references' option.

3. (optional) Writes a json file containing version information.  This can be consumed by an external
application.

Versioning and replacements are done in one or more 'phases'.  This is necessary when you update file
references inside of files that also need to be versioned.  For example: CSS files refer to versioned
image files, but the CSS files themselves need to be versioned.  The CSS files cannot be versioned
until the references have been updated because versioning depends on the file contents being
finalized.


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
* 2014-02-03 0.3.0  Added `baseDir` option.  Filepaths in versionFile are now relative to the directory of the version file.  The `version` option was renamed to `versionFile`.

## License
Copyright (c) 2014 Chris Danford
Licensed under the MIT license.



