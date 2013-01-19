
@echo off
echo Generating game.css...
java -jar ..\..\closure\gss\closure-stylesheets-20111230.jar ^
  --output-file ..\..\war\css\game.css ^
  ..\..\js_src\ui\mixin.css ^
  ..\..\js_src\ui\base.css ^
  ..\..\js_src\ui\button.css ^
  ..\..\js_src\ui\input.css ^
  ..\..\js_src\ui\dialog.css ^
  ..\..\js_src\ui\menu\menu.css ^
  ..\..\js_src\ui\header\header.css ^
  ..\..\js_src\ui\selection\selection.css ^
  ..\..\js_src\ui\browser\cardbrowser.css ^
  ..\..\js_src\game\ui\main.css ^
  ..\..\js_src\game\ui\attack\attack.css ^
  ..\..\js_src\game\ui\browser\browser.css ^
  ..\..\js_src\game\ui\chat\chat.css ^
  ..\..\js_src\game\ui\connection\status.css ^
  ..\..\js_src\game\ui\deck\select.css ^
  ..\..\js_src\game\ui\field\field.css ^
  ..\..\js_src\game\ui\counters\counters.css ^
  ..\..\js_src\game\ui\hand\hand.css ^
  ..\..\js_src\game\ui\player\player.css ^
  ..\..\js_src\game\ui\sync\sync.css ^
  ..\..\js_src\game\ui\waiting\waiting.css
