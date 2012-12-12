/**
 * Utility class for tests in Yugioh.
 */

goog.provide('yugi.test');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.functions');
/** @suppress {extraRequire} */
goog.require('goog.testing.Mock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.mockmatchers');
goog.require('goog.testing.mockmatchers.ArgumentMatcher');


/**
 * Verifies the execution of the given function.  This is a convenience method
 * so you don't have to write the $replayAll(), $verifyAll(), and $resetAll()
 * lines everywhere.
 * @param {!goog.testing.MockControl} mockControl The mock control.
 * @param {!Function} fn The function to execute after $replayAll() and before
 *     $verifyAll() and $resetAll().
 * @param {Object=} opt_this Specifies the object which "this" should point to
 *     when the function is ran.
 * @param {...*} var_args The objects to cleanup.
 */
yugi.test.verify = function(mockControl, fn, opt_this, var_args) {
  mockControl.$replayAll();
  fn.apply(opt_this, goog.array.slice(arguments, 3));
  mockControl.$verifyAll();
  mockControl.$resetAll();
};


/**
 * Ticks the clock and verifies.
 * @param {!goog.testing.MockControl} mockControl The mock control object.
 * @param {!goog.testing.MockClock} mockClock The mock clock.
 * @param {number} delay The delay, in milliseconds, by which to tick the clock.
 */
yugi.test.tickAndVerify = function(mockControl, mockClock, delay) {
  yugi.test.verify(mockControl, function() {
    mockClock.tick(delay);
  });
};


/**
 * Creates an sandbox element to test UI components.  It is automatically
 * appended to the document's body tag and returned to the caller for future
 * clean-up.
 * @return {!Element} The sandbox element that is now appended to the body.
 */
yugi.test.createSandbox = function() {
  var dom = goog.dom.getDomHelper();
  var sandbox = dom.createElement(goog.dom.TagName.DIV);
  dom.appendChild(dom.getDocument().body, sandbox);
  return sandbox;
};


/**
 * Fires a click event on the element within the replay block of a test.  This
 * is a convenience method for clicking an element and verifying expectations.
 * The most common use case is to set expectations on your mocked objects, then
 * call this method to verify clicking the element meets those expectations.
 *
 * @param {!goog.testing.MockControl} mockControl The mock control object.
 * @param {!Element} element The element to click.
 */
yugi.test.clickAndVerify = function(mockControl, element) {
  yugi.test.verify(mockControl, function() {
    goog.testing.events.fireClickSequence(element);
  });
};


/**
 * Ignores the attachment of listeners on the given set of mock objects.
 * @param {...!goog.testing.Mock} mockedObjects The set of mocked objects
 *     on which to ignore listener attachment.
 */
yugi.test.expectAnyListeners = function(mockedObjects) {
  var ignore = goog.testing.mockmatchers.ignoreArgument;
  for (var i = 0; i < arguments.length; i++) {
    var mockedObject = arguments[i];
    mockedObject.addEventListener(ignore, ignore, ignore).$anyTimes();
    mockedObject.removeEventListener(ignore, ignore, ignore).$anyTimes();
  }
};


/**
 * Expects an event to occur on the given mocked event target.
 * @param {!goog.testing.Mock} mockEventTarget The mocked event target.  The
 *     mocked object must be one that extends {goog.events.EventTarget}.
 * @param {string} type The expected type of event.
 * @param {Object=} opt_eventClass The expected class of which the event should
 *     be an instance.
 * @param {function(): boolean=} opt_matcherFn A function to do additional
 *     matching on the event.
 */
yugi.test.expectEvent =
    function(mockEventTarget, type, opt_eventClass, opt_matcherFn) {
  var matcherFn = opt_matcherFn || goog.functions.TRUE;
  /** @type {!goog.events.EventTarget} */ (mockEventTarget).dispatchEvent(
      new goog.testing.mockmatchers.ArgumentMatcher(
          function(event) {
            assertNotNull(event);

            // Match the type.
            var eventType = event.type || event;
            var typeMatches = eventType === type;

            // Match the class.
            var classMatches = opt_eventClass ?
                event instanceof opt_eventClass : true;

            return typeMatches && classMatches && matcherFn(event);
          }, 'Expected event with type = ' + type));
};


/**
 * Dispatches an event on the mocked object and verifies the mock control.  This
 * is a convenience method that will correctly dispatch the event on the mocked
 * object which requires setting up the parent event target.  The event will
 * then be dispatched within the usual $replayAll(), $verifyAll(), and
 * $resetAll() section of the test.
 *
 * Example usage of this function:
 *   // Set up all expectations before event dispatch.
 *   mockedObject.someMethod().$returns(someValue);
 *   ...
 *   yugi.test.dispatchAndVerify(mockControl, mockedObject, someEvent);
 *   // End test - no need to call $replayAll(), $verifyAll(), or $resetAll().
 *
 * @param {!goog.testing.MockControl} mockControl The mock control object.
 * @param {*} mockedObject The mocked object on which the event should be
 *     dispatched.  This class being mocked *must* be extending
 *     {goog.events.EventTarget}.
 * @param {!goog.events.Event|string} event The event to dispatch.
 */
yugi.test.dispatchAndVerify =
    function(mockControl, mockedObject, event) {

  // Set the expectations for dispatching on a mocked event target.
  var mockedFunction = /** @type {!goog.events.EventTarget} */ (mockedObject).
      getParentEventTarget();
  /** @type {!goog.testing.Mock} */ (mockedFunction).$returns(null).$anyTimes();

  // Replay everything, dispatch the event, then verify.
  yugi.test.verify(mockControl, function() {
    goog.events.dispatchEvent(
        /** @type {!goog.events.EventTarget} */ (mockedObject), event);
  });
};


/**
 * Disposes of everything including cleaning up objects that are in the DOM then
 * performs an event listener leak check.
 * @param {...*} var_args The objects to dispose.
 */
yugi.test.tearDown = function(var_args) {

  // Dispose of everything.
  for (var i = 0; i < arguments.length; i++) {
    yugi.test.dispose(arguments[i]);
  }

  // Check for memory leaks.
  var totalListeners = goog.events.getTotalListenerCount();
  if (totalListeners) {
    // Remove all events so the next test is clean.
    goog.events.removeAll();
    // Say that this test failed.
    if (totalListeners == 1) {
      throw new Error(totalListeners + ' listener was leaked!');
    } else {
      throw new Error(totalListeners + ' listeners were leaked!');
    }
  }
};


/**
 * Disposes of any kind of object safely.  Handles all sorts of input, including
 * null, undefined, DOM nodes, goog.Disposable objects, etc.
 * @param {*} object The object to dispose.
 */
yugi.test.dispose = function(object) {
  if (!goog.isDefAndNotNull(object)) {
    return;
  }
  if (object instanceof goog.testing.MockControl) {
    var mc = /** @type {!goog.testing.MockControl} */ (object);
    mc.$resetAll();
    mc.$tearDown();
  } else if (object instanceof goog.testing.PropertyReplacer) {
    var pr = /** @type {!goog.testing.PropertyReplacer} */ (object);
    pr.reset();
  } else if (goog.dom.isNodeLike(object)) {
    var node = /** @type {!Node} */ (object);
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  } else {
    // The catch all which will call dispose() if it is a goog.Disposable.
    goog.dispose(object);
  }
};
