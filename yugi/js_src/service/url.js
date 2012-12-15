/**
 * Utilities for URLs.
 */

goog.provide('yugi.service.url');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('yugi.Config');


/**
 * Navigates to a URL that is specific to this application.  The mode=dev
 * parameter will be included if it is set in the configuration.
 * @param {!yugi.Config.ServletPath} servletPath The servlet path.
 * @param {...*} var_args The URL parameters ordered in key value pairs.  Here's
 *     an example: navigate(path, key1, value1, key2, value2).
 */
yugi.service.url.navigate = function(servletPath, var_args) {
  var url = yugi.service.url.build(servletPath, goog.array.slice(arguments, 1));
  yugi.service.url.navigate_(url);
};


/**
 * Builds an absolute URL that will keep the base that same.  For example, if in
 * dev mode, the base will be localhost.  In production it will be
 * yu-gi-oh.appspot.com. is specific to this application.  The mode=dev
 * parameter will be included if it is set in the configuration.
 * @param {!yugi.Config.ServletPath} servletPath The servlet path.
 * @param {...*} var_args The URL parameters ordered in key value pairs.  Here's
 *     an example: buildAbsolute(path, key1, value1, key2, value2).
 * @return {string} The constructed URL.
 */
yugi.service.url.buildAbsolute = function(servletPath, var_args) {
  return yugi.service.url.build_(servletPath, true,
      goog.array.slice(arguments, 1));
};


/**
 * Builds a URL that is specific to this application.  The mode=dev parameter
 * will be included if it is set in the configuration.
 * @param {!yugi.Config.ServletPath} servletPath The servlet path.
 * @param {...*} var_args The URL parameters ordered in key value pairs.  Here's
 *     an example: build(path, key1, value1, key2, value2).
 * @return {string} The constructed URL.
 */
yugi.service.url.build = function(servletPath, var_args) {
  return yugi.service.url.build_(servletPath, false,
      goog.array.slice(arguments, 1));
};


/**
 * Builds a URL that is specific to this application.  The mode=dev parameter
 * will be included if it is set in the configuration.
 * @param {!yugi.Config.ServletPath} servletPath The servlet path.
 * @param {boolean=} opt_absolute True if the base part of the URL should be
 *     included or not.
 * @param {...*} var_args The URL parameters ordered in key value pairs.  Here's
 *     an example: build_(path, false, key1, value1, key2, value2).
 * @return {string} The constructed URL.
 * @private
 */
yugi.service.url.build_ = function(servletPath, opt_absolute, var_args) {

  // Create the base URI with the servlet path set.
  var uri = new goog.Uri();
  if (opt_absolute) {
    uri = goog.Uri.parse(window.location.href);
  }
  uri.setPath(servletPath);

  // Set all the URL parameters.
  uri.getQueryData().clear();
  var queryData = goog.array.slice(arguments, 2)[0];

  // This handles the special case where var_args are passed through two layers
  // as is the case with navigate.
  if (queryData.length == 1 && goog.isArray(queryData[0])) {
    queryData = queryData[0];
  }

  if (queryData.length % 2 != 0) {
    throw new Error('The var args to build_ needs to be even.');
  }
  for (var i = 0; i < queryData.length; i += 2) {
    uri.setParameterValue(queryData[i], queryData[i + 1]);
  }

  // Forward the mode parameter.
  if (yugi.Config.isDevMode() || yugi.Config.isRawMode()) {
    uri.setParameterValue(yugi.Config.UrlParameter.MODE, yugi.Config.getMode());
  }

  return uri.toString();
};


/**
 * Private method that actually redirects the page to the given URL.  This is a
 * separate function so it can be mocked out by unit tests.
 * @param {string} url The URL to which to navigate.
 * @private
 */
yugi.service.url.navigate_ = function(url) {
  window.location.href = url;
};
