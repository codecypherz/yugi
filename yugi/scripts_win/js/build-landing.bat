
@echo off

echo ======================
echo Building landing.js...
echo ======================
..\..\closure\bin\build\closurebuilder.py ^
  --root ..\..\closure\ ^
  --root ..\..\js_src\ ^
  --root ..\..\js_generated\ ^
  -n yugi.landing ^
  -c ..\..\closure\compiler\compiler.jar ^
  -o compiled ^
  -f --compilation_level=ADVANCED_OPTIMIZATIONS ^
  -f --warning_level=VERBOSE ^
  -f --closure_entry_point=yugi.landing.Main ^
  -f --accept_const_keyword ^
  -f --externs=..\..\js_externs\externs.js ^
  --output_file=..\..\war\js\landing.js
echo Finished building landing.js.

echo ==========================
echo Finished building landing.
echo ==========================
