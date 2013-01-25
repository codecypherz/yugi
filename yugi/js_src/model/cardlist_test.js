/**
 * Tests for yugi.model.CardList
 */

/** @suppress {extraProvide} */
goog.provide('yugi.model.CardListTest');

goog.require('goog.array');
goog.require('yugi.model.Area');
goog.require('yugi.model.CardList');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.model.SpellCard');
goog.require('yugi.model.TrapCard');
goog.require('yugi.test');

var cardList;

function setUp() {
  cardList = new yugi.model.CardList(yugi.model.Area.PLAYER_HAND);
}

function tearDown() {
  yugi.test.tearDown(cardList);
}

function testPreconditions() {
  assertEquals(yugi.model.Area.PLAYER_HAND, cardList.getArea());
  assertEquals(0, cardList.getCards().length);
  validateCardList();
}

function testSetCards_updatesLocation() {
  var cards = [];
  cards.push(new yugi.model.MonsterCard());
  cards.push(new yugi.model.SpellCard());
  cards.push(new yugi.model.TrapCard());
  assertCardAreas(cards, yugi.model.Area.UNSPECIFIED);

  cardList.setCards(cards);
  validateCardList();
}

function testClone() {
  var cards = [];
  cards.push(new yugi.model.MonsterCard());
  cards.push(new yugi.model.SpellCard());
  cards.push(new yugi.model.TrapCard());
  cardList.setCards(cards);
  validateCardList();

  var clonedList = cardList.clone();
  assertCardLocations(clonedList.getCards(), cardList.getArea());
}

function testSetArea_updatesCards() {
  var cards = [];
  cards.push(new yugi.model.MonsterCard());
  cards.push(new yugi.model.SpellCard());
  cards.push(new yugi.model.TrapCard());
  cardList.setCards(cards);
  validateCardList();

  cardList.setArea(yugi.model.Area.PLAYER_DECK);
  validateCardList();
}

function testAdd_addsToFront() {
  var monsterCard = new yugi.model.MonsterCard();
  cardList.add(monsterCard, true);
  assertEquals(1, cardList.getCards().length);
  assertEquals(monsterCard, cardList.getCards()[0]);
  assertEquals(0, monsterCard.getLocation().getIndex());
  assertEquals(cardList.getArea(), monsterCard.getLocation().getArea());
  validateCardList();

  var spellCard = new yugi.model.SpellCard();
  cardList.add(spellCard, true);
  assertEquals(2, cardList.getCards().length);
  assertEquals(spellCard, cardList.getCards()[0]);
  assertEquals(monsterCard, cardList.getCards()[1]);
  assertEquals(0, spellCard.getLocation().getIndex());
  assertEquals(1, monsterCard.getLocation().getIndex());
  assertEquals(cardList.getArea(), spellCard.getLocation().getArea());
  validateCardList();
}

function testAdd_addsToEnd() {
  var monsterCard = new yugi.model.MonsterCard();
  cardList.add(monsterCard);
  assertEquals(1, cardList.getCards().length);
  assertEquals(monsterCard, cardList.getCards()[0]);
  assertEquals(0, monsterCard.getLocation().getIndex());
  assertEquals(cardList.getArea(), monsterCard.getLocation().getArea());
  validateCardList();

  var spellCard = new yugi.model.SpellCard();
  cardList.add(spellCard);
  assertEquals(2, cardList.getCards().length);
  assertEquals(monsterCard, cardList.getCards()[0]);
  assertEquals(spellCard, cardList.getCards()[1]);
  assertEquals(0, monsterCard.getLocation().getIndex());
  assertEquals(1, spellCard.getLocation().getIndex());
  assertEquals(cardList.getArea(), spellCard.getLocation().getArea());
  validateCardList();
}

function testRemove_updatesIndices() {
  var monsterCard = new yugi.model.MonsterCard();
  var spellCard = new yugi.model.SpellCard();
  var trapCard = new yugi.model.TrapCard();
  cardList.add(monsterCard);
  cardList.add(spellCard);
  cardList.add(trapCard);
  validateCardList();

  assertEquals(1, spellCard.getLocation().getIndex());
  assertEquals(2, trapCard.getLocation().getIndex());
  assertTrue(cardList.remove(spellCard));
  assertEquals(1, trapCard.getLocation().getIndex());
  validateCardList();
}

function testRemoveFirst() {
  var monsterCard = new yugi.model.MonsterCard();
  var spellCard = new yugi.model.SpellCard();
  var trapCard = new yugi.model.TrapCard();
  cardList.add(monsterCard);
  cardList.add(spellCard);
  cardList.add(trapCard);
  validateCardList();

  assertEquals(monsterCard, cardList.removeFirst());
  validateCardList();
}


/**
 * Validates the card list by checking that all cards match the card list area
 * and that each card's index matches the index in the card list.
 */
function validateCardList() {
  assertCardLocations(cardList.getCards(), cardList.getArea());
}


/**
 * Asserts the card locations match the area and the index in the array.
 * @param {!Array.<!yugi.model.Card>} cards The cards to check.
 * @param {!yugi.model.Area} area The area the cards should have.
 */
function assertCardLocations(cards, area) {
  goog.array.forEach(cards, function(card, i, cards) {
    var location = card.getLocation();
    assertEquals(area, location.getArea());
    assertEquals(i, location.getIndex());
  });
}


/**
 * Asserts the card area is correct for all the cards.
 * @param {!Array.<!yugi.model.Card>} cards The cards to check.
 * @param {!yugi.model.Area} area The area the cards should have.
 */
function assertCardAreas(cards, area) {
  goog.array.forEach(cards, function(card, i, cards) {
    assertEquals(area, card.getLocation().getArea());
  });
}
