
@echo off
echo Generating admin card.css...
java -jar ..\..\closure\gss\closure-stylesheets-20111230.jar ^
  --output-file ..\..\war\css\admin\card.css ^
  ..\..\js_src\ui\mixin.css ^
  ..\..\js_src\ui\base.css ^
  ..\..\js_src\ui\button.css ^
  ..\..\js_src\ui\input.css ^
  ..\..\js_src\ui\dialog.css ^
  ..\..\js_src\ui\header\header.css ^
  ..\..\js_src\ui\footer\footer.css ^
  ..\..\js_src\ui\selection\selection.css ^
  ..\..\js_src\admin\card\ui\card.css ^
  ..\..\js_src\admin\ui\admin.css
