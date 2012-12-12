
@echo off

echo =====================
echo Building search.js...
echo =====================
..\..\closure\bin\build\closurebuilder.py ^
  --root ..\..\closure\ ^
  --root ..\..\js_src\ ^
  --root ..\..\js_generated\ ^
  -n yugi.admin.search ^
  -c ..\..\closure\compiler\compiler.jar ^
  -o compiled ^
  -f --compilation_level=ADVANCED_OPTIMIZATIONS ^
  -f --warning_level=VERBOSE ^
  -f --closure_entry_point=yugi.admin.search.Main ^
  -f --accept_const_keyword ^
  -f --externs=..\..\js_externs\externs.js ^
  --output_file=..\..\war\js\admin\search.js
echo Finished building search.js.

echo ===============================
echo Finished building admin search.
echo ===============================
