
echo Running the linter...
./linter.sh

echo Generating the soy template JS...
./soy.sh

echo Generating deps.js...
./gen-deps.sh

./gss/build-deck-editor-gss.sh

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

echo ==============================
echo Finished building deck editor!
echo ==============================
