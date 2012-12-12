/**
 * Tests for yugi.service.url.
 */

/** @suppress {extraProvide} */
goog.provide('yugi.service.urlTest');

goog.require('goog.string');
goog.require('goog.testing.MockControl');
goog.require('yugi.Config');
goog.require('yugi.service.url');
goog.require('yugi.test');

var mc;
var mockConfig;
var newUrl;

function setUp() {
  mc = new goog.testing.MockControl();

  mockConfig = mc.createLooseMock(yugi.Config);
  yugi.Config.instance_ = mockConfig;

  // Mock out the real navigate function for a recording.
  yugi.service.url.navigate_ = function(url) {
    newUrl = url;
  };
  newUrl = null;
}

function tearDown() {
  goog.dispose(mc);
}

function testBuildWithParams() {
  var path = yugi.Config.ServletPath.LANDING;
  var key = 'key';
  var value = 'value';
  mockConfig.getMode().$returns(yugi.Config.Mode.NORMAL).$anyTimes();

  yugi.test.verify(mc, function() {
    var url = yugi.service.url.build(path, key, value);

    var expected = path + '?' + key + '=' + value;
    assertEquals(expected, url);
  });
}

function testBuildWithParamsForwardsDevMode() {
  var path = yugi.Config.ServletPath.LANDING;
  var key = 'key';
  var value = 'value';
  mockConfig.getMode().$returns(yugi.Config.Mode.DEV).$anyTimes();

  yugi.test.verify(mc, function() {
    var url = yugi.service.url.build(path, key, value);

    var expected = path + '?' + key + '=' + value + '&' +
        yugi.Config.UrlParameter.MODE + '=' + yugi.Config.Mode.DEV;
    assertEquals(expected, url);
  });
}

function testBuildAbsolute() {
  var path = yugi.Config.ServletPath.JOIN_GAME;
  mockConfig.getMode().$returns(yugi.Config.Mode.NORMAL).$anyTimes();

  yugi.test.verify(mc, function() {
    var url = yugi.service.url.buildAbsolute(path);
    assertTrue(goog.string.endsWith(url, path));
    assertNotEquals(path, url);
  });
}

function testBuildAbsoluteWithParams() {
  var path = yugi.Config.ServletPath.JOIN_GAME;
  var key1 = 'key1';
  var value1 = 'value1';
  var key2 = 'key2';
  var value2 = 'value2';
  mockConfig.getMode().$returns(yugi.Config.Mode.NORMAL).$anyTimes();

  yugi.test.verify(mc, function() {
    var url = yugi.service.url.buildAbsolute(path, key1, value1, key2, value2);
    var endsWith = path + '?' + key1 + '=' + value1 + '&' + key2 + '=' + value2;
    assertTrue(goog.string.endsWith(url, endsWith));
  });
}

function testNavigateWithParams() {
  var path = yugi.Config.ServletPath.LANDING;
  var key = 'key';
  var value = 'value';
  mockConfig.getMode().$returns(yugi.Config.Mode.NORMAL).$anyTimes();

  yugi.test.verify(mc, function() {
    yugi.service.url.navigate(path, key, value);
  });
  assertNotNull(newUrl);
}
