
@echo off
echo Generating deck-editor.css...
java -jar ..\..\closure\gss\closure-stylesheets-20111230.jar ^
  --output-file ..\..\war\css\deck-editor.css ^
  ..\..\js_src\ui\mixin.css ^
  ..\..\js_src\ui\base.css ^
  ..\..\js_src\ui\button.css ^
  ..\..\js_src\ui\input.css ^
  ..\..\js_src\ui\dialog.css ^
  ..\..\js_src\ui\header\header.css ^
  ..\..\js_src\ui\footer\footer.css ^
  ..\..\js_src\ui\menu\menu.css ^
  ..\..\js_src\ui\selection\selection.css ^
  ..\..\js_src\ui\browser\cardbrowser.css ^
  ..\..\js_src\ui\search\search.css ^
  ..\..\js_src\admin\ui\admin.css ^
  ..\..\js_src\deck\editor\ui\deck-editor.css
