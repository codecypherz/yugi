
@echo off
echo Generating deck-manager.css...
java -jar ..\..\closure\gss\closure-stylesheets-20111230.jar ^
  --output-file ..\..\war\css\deck-manager.css ^
  ..\..\js_src\ui\mixin.css ^
  ..\..\js_src\ui\base.css ^
  ..\..\js_src\ui\button.css ^
  ..\..\js_src\ui\input.css ^
  ..\..\js_src\ui\dialog.css ^
  ..\..\js_src\ui\header\header.css ^
  ..\..\js_src\ui\footer\footer.css ^
  ..\..\js_src\ui\menu\menu.css ^
  ..\..\js_src\deck\manager\ui\deck-manager.css
