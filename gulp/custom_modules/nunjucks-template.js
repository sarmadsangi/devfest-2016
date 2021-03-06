const _ = require('lodash')
const fs = require('fs')
const gutil = require('gulp-util')
const path = require('path')
const through = require('through2')
const nunjucks = require('nunjucks')
const nunjucksMarkdown = require('nunjucks-markdown')
const marked = require('marked')
const stripJSONComments = require('strip-json-comments')

// Get config from config.js
const config = require('../config')

function nunjuckTemplate (options) {
  var defaults = {
    templateDir: './src/templates',
    templateExt: '.nunjucks'
  }

  options = _.assign(defaults, options)

  return through.obj((file, enc, cb) => {
    if (file.isStream()) {
      cb(new gutil.PluginError('nunjucks-template', 'Streaming not supported'))
      return
    }

    // globalData = file.globalData || {},
    var data = {}
    var localData = file.localData || {}
    var frontmatterData = file.frontmatter || {}
    var markdownData
    var templatePath

    // Set markdown data to (if any)
    markdownData = file.contents ? {body: file.contents.toString()} : {}

    // Gets data from data (if any)

    if (options.data) {
      data = getDataFromSource(options.data, data)
    }

    // Gets data from additional sources (if any)
    if (file.frontmatter) {
      var sources = file.frontmatter.data || file.frontmatter.sources
      if (_.isString(sources)) {
        localData = getDataFromSource(sources, localData)
      } else if (_.isArray(sources)) {
        _.forEach(sources, (source) => {
          localData = getDataFromSource(source, localData)
        })
      }
    }

    // consolidates data
    data = _.assign(data, frontmatterData, markdownData, localData)

    /**
     * Figures out Template Path
     * Priority 1 : options given by user
     * Priority 2 : template in frontmatter
     * Fallback   : Use self
     */

    if (options.template) {
      templatePath = path.join(process.cwd(), options.templateDir, options.template + options.templateExt)

      try {
        fs.openSync(templatePath, 'r')
      } catch (e) {
        cb(pluginError(`${options.template}${options.templateExt} not found in ${options.templateDir}`))
      }
    } else if (!_.isEmpty(frontmatterData) && frontmatterData.template) {
      templatePath = path.join(file.cwd, options.templateDir, frontmatterData.template + options.templateExt)
      try {
        fs.openSync(templatePath, 'r')
      } catch (e) {
        cb(pluginError(`${frontmatterData.template}${options.templateExt} not found in ${options.templateDir}`))
      }
    } else {
      templatePath = file.path
    }

    var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(
      [options.templateDir, path.join(process.cwd(), 'src/pages')],
      {
        autoescape: true,
        watch: false,
        nocache: true
      }
     ))

    marked.setOptions(config.blog.markdownOptions)
    nunjucksMarkdown.register(env, marked)

    env.render(templatePath, data, (err, res) => {
      if (err) cb(pluginError(err))

      file.contents = new Buffer(res)
      cb(null, file)
    })
  })
}

function pluginError (message) {
  return new gutil.PluginError('templator', message)
}

// Gets JSON data from file path and assign to given data object
function getDataFromSource (filepath, returnedData) {
  try {
    var data = JSON.parse(stripJSONComments(fs.readFileSync(filepath).toString()))
    returnedData = _.assign(returnedData, data)
  } catch (e) {
    gutil.log(gutil.colors.red(`Data in ${filepath} is not valid JSON`))
  }

  return returnedData
}

module.exports = nunjuckTemplate
