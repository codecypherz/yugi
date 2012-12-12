
echo Running the linter...
./linter.sh

echo Generating the soy template JS...
./soy.sh

echo Generating deps.js...
./gen-deps.sh

./gss/build-card-gss.sh

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

echo =============================
echo Finished building admin card!
echo =============================
