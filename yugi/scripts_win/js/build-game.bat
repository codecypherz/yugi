
@echo off

echo ===================
echo Building game.js...
echo ===================
..\..\closure\bin\build\closurebuilder.py ^
  --root ..\..\closure\ ^
  --root ..\..\js_src\ ^
  --root ..\..\js_generated\ ^
  -n yugi.game ^
  -c ..\..\closure\compiler\compiler.jar ^
  -o compiled ^
  -f --compilation_level=ADVANCED_OPTIMIZATIONS ^
  -f --warning_level=VERBOSE ^
  -f --closure_entry_point=yugi.game.Main ^
  -f --accept_const_keyword ^
  -f --externs=..\..\js_externs\externs.js ^
  --output_file=..\..\war\js\game.js
echo Finished building game.js.

echo =======================
echo Finished building game.
echo =======================
