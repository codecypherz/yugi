
echo Running the linter...
./linter.sh

echo Generating the soy template JS...
./soy.sh

echo Generating deps.js...
./gen-deps.sh

./gss/build-landing-gss.sh

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

echo =============================
echo Finished building landing!
echo =============================
