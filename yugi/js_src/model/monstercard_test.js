/**
 * Tests for yugi.model.MonsterCard
 */

/** @suppress {extraProvide} */
goog.provide('yugi.model.MonsterCardTest');

goog.require('yugi.model.Card');
goog.require('yugi.model.MonsterCard');
goog.require('yugi.test');


function tearDown() {
  yugi.test.tearDown();
}

function testSetFromJson() {
  var key = 'some-key';
  var name = 'Some Name';
  var description = 'This is a card description.';
  var imageSource = 'http://some.server/image?card_key=some-key';
  var attribute = 'fire';
  var monsterType = 'black magic';
  var monsterExtraType = 'dark synchro';
  var attack = '?';
  var defense = '1234';
  var level = '5';
  var effect = 'true';

  var json = {
    'type': 'monster',
    'key': key,
    'name': name,
    'description': description,
    'image-source': imageSource,
    'attribute': attribute,
    'monster-type': monsterType,
    'monster-extra-type': monsterExtraType,
    'attack': attack,
    'defense': defense,
    'level': level,
    'effect': effect
  };

  var monsterCard = new yugi.model.MonsterCard();
  monsterCard.setFromJson(json);

  assertNotNull(monsterCard);
  assertEquals(yugi.model.Card.Type.MONSTER, monsterCard.getType());
  assertEquals(key, monsterCard.getKey());
  assertEquals(name, monsterCard.getName());
  assertEquals(description, monsterCard.getDescription());
  assertEquals(imageSource, monsterCard.imageSource_);
  assertEquals(yugi.model.MonsterCard.Attribute.FIRE,
      monsterCard.getAttribute());
  assertEquals(yugi.model.MonsterCard.Type.BLACK_MAGIC,
      monsterCard.getMonsterType());
  assertEquals(yugi.model.MonsterCard.ExtraType.DARK_SYNCHRO,
      monsterCard.getExtraType());
  assertEquals(yugi.model.MonsterCard.VARIABLE_NUMBER, monsterCard.getAttack());
  assertEquals(1234, monsterCard.getDefense());
  assertEquals(5, monsterCard.getLevel());
  assertEquals(true, monsterCard.isEffect());
}
