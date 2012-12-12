
@echo off

echo ==========================
echo Building deck-editor.js...
echo ==========================
..\\closure\bin\build\closurebuilder.py ^
  --root ..\..\closure\ ^
  --root ..\..\js_src\ ^
  --root ..\..\js_generated\ ^
  -n yugi.deck.editor ^
  -c ..\..\closure\compiler\compiler.jar ^
  -o compiled ^
  -f --compilation_level=ADVANCED_OPTIMIZATIONS ^
  -f --warning_level=VERBOSE ^
  -f --closure_entry_point=yugi.deck.editor.Main ^
  -f --accept_const_keyword ^
  -f --externs=..\..\js_externs\externs.js ^
  --output_file=..\..\war\js\deck-editor.js
echo Finished building deck-editor.js.

echo ==============================
echo Finished building deck editor.
echo ==============================
