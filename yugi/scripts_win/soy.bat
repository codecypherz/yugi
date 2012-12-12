
@echo off
echo Deleting all old soy files.
rmdir /s /q ..\js_generated
mkdir ..\js_generated

echo Building all soy templates...
java -jar ..\closure\soy\SoyToJsSrcCompiler.jar ^
  --shouldProvideRequireSoyNamespaces ^
  --shouldGenerateJsdoc ^
  --inputPrefix ..\js_src\ ^
  --outputPathFormat ..\js_generated\{INPUT_DIRECTORY}{INPUT_FILE_NAME_NO_EXT}_soy.js ^
  admin\card\ui\ui.soy ^
  admin\search\ui\ui.soy ^
  admin\ui\header.soy ^
  deck\editor\ui\ui.soy ^
  deck\manager\ui\deck.soy ^
  game\ui\main.soy ^
  game\ui\browser\browser.soy ^
  game\ui\chat\chat.soy ^
  game\ui\deck\select.soy ^
  game\ui\field\field.soy ^
  game\ui\hand\hand.soy ^
  game\ui\player\player.soy ^
  game\ui\sync\sync.soy ^
  game\ui\waiting\waiting.soy ^
  landing\ui\launcher\launcher.soy ^
  ui\browser\cardbrowser.soy ^
  ui\footer\footer.soy ^
  ui\header\header.soy ^
  ui\menu\menu.soy ^
  ui\search\search.soy ^
  ui\selection\selection.soy

echo Finished build the soy templates.
