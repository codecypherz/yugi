
@echo off

echo ===========================
echo Building deck-manager.js...
echo ===========================
..\..\closure\bin\build\closurebuilder.py ^
  --root ..\..\closure\ ^
  --root ..\..\js_src\ ^
  --root ..\..\js_generated\ ^
  -n yugi.deck.manager ^
  -c ..\..\closure\compiler\compiler.jar ^
  -o compiled ^
  -f --compilation_level=ADVANCED_OPTIMIZATIONS ^
  -f --warning_level=VERBOSE ^
  -f --closure_entry_point=yugi.deck.manager.Main ^
  -f --accept_const_keyword ^
  -f --externs=..\..\js_externs\externs.js ^
  --output_file=..\..\war\js\deck-manager.js
echo Finished building deck-manager.js.

echo ===============================
echo Finished building deck manager.
echo ===============================
