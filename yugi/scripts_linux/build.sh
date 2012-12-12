
echo Running the linter...
./linter.sh

echo Generating the soy template JS...
./soy.sh

echo Generating deps.js...
./gen-deps.sh

echo Generating the CSS...
./gss.sh

echo ======================
echo Building landing.js...
echo ======================
../../google-closure/closure/bin/build/closurebuilder.py \
  --root ../../google-closure/ \
  --root ../js_src/ \
  --root ../js_generated/ \
  -n yugi.landing \
  -c ../../google-closure/compiler/compiler.jar \
  -o compiled \
  -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
  -f "--warning_level=VERBOSE" \
  -f "--closure_entry_point=yugi.landing.Main" \
  -f "--accept_const_keyword" \
  -f "--externs=../js_externs/externs.js" \
  --output_file="../war/js/landing.js"
echo Finished building landing.js.

echo ===================
echo Building game.js...
echo ===================
../../google-closure/closure/bin/build/closurebuilder.py \
  --root ../../google-closure/ \
  --root ../js_src/ \
  --root ../js_generated/ \
  -n yugi.game \
  -c ../../google-closure/compiler/compiler.jar \
  -o compiled \
  -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
  -f "--warning_level=VERBOSE" \
  -f "--closure_entry_point=yugi.game.Main" \
  -f "--accept_const_keyword" \
  -f "--externs=../js_externs/externs.js" \
  --output_file="../war/js/game.js"
echo Finished building game.js.

echo ===================
echo Building card.js...
echo ===================
../../google-closure/closure/bin/build/closurebuilder.py \
  --root ../../google-closure/ \
  --root ../js_src/ \
  --root ../js_generated/ \
  -n yugi.admin.card \
  -c ../../google-closure/compiler/compiler.jar \
  -o compiled \
  -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
  -f "--warning_level=VERBOSE" \
  -f "--closure_entry_point=yugi.admin.card.Main" \
  -f "--accept_const_keyword" \
  -f "--externs=../js_externs/externs.js" \
  --output_file="../war/js/admin/card.js"
echo Finished building card.js.

echo =====================
echo Building search.js...
echo =====================
../../google-closure/closure/bin/build/closurebuilder.py \
  --root ../../google-closure/ \
  --root ../js_src/ \
  --root ../js_generated/ \
  -n yugi.admin.search \
  -c ../../google-closure/compiler/compiler.jar \
  -o compiled \
  -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
  -f "--warning_level=VERBOSE" \
  -f "--closure_entry_point=yugi.admin.search.Main" \
  -f "--accept_const_keyword" \
  -f "--externs=../js_externs/externs.js" \
  --output_file="../war/js/admin/search.js"
echo Finished building search.js.

echo ===========================
echo Building deck-manager.js...
echo ===========================
../../google-closure/closure/bin/build/closurebuilder.py \
  --root ../../google-closure/ \
  --root ../js_src/ \
  --root ../js_generated/ \
  -n yugi.deck.manager \
  -c ../../google-closure/compiler/compiler.jar \
  -o compiled \
  -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
  -f "--warning_level=VERBOSE" \
  -f "--closure_entry_point=yugi.deck.manager.Main" \
  -f "--accept_const_keyword" \
  -f "--externs=../js_externs/externs.js" \
  --output_file="../war/js/deck-manager.js"
echo Finished building deck-manager.js.

echo ==========================
echo Building deck-editor.js...
echo ==========================
../../google-closure/closure/bin/build/closurebuilder.py \
  --root ../../google-closure/ \
  --root ../js_src/ \
  --root ../js_generated/ \
  -n yugi.deck.editor \
  -c ../../google-closure/compiler/compiler.jar \
  -o compiled \
  -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
  -f "--warning_level=VERBOSE" \
  -f "--closure_entry_point=yugi.deck.editor.Main" \
  -f "--accept_const_keyword" \
  -f "--externs=../js_externs/externs.js" \
  --output_file="../war/js/deck-editor.js"
echo Finished building deck-editor.js.

echo =============================
echo Finished building everything!
echo =============================
