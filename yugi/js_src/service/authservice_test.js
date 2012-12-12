/**
 * Tests for yugi.service.AuthService.
 */

/** @suppress {extraProvide} */
goog.provide('yugi.service.AuthServiceTest');

goog.require('goog.testing.MockControl');
goog.require('yugi.Config');

var mc;
var mockConfig;
var newUrl;

function setUp() {
  mc = new goog.testing.MockControl();

  mockConfig = mc.createLooseMock(yugi.Config);
  yugi.Config.instance_ = mockConfig;
}

function tearDown() {
  goog.dispose(mc);
}

function testSomething() {
  fail();
}
