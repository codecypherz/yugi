
echo Generating landing.css...
java -jar ../../Closure/gss/closure-stylesheets-20111118.jar \
  --output-file ../war/css/landing.css \
  ../js_src/ui/mixin.css \
  ../js_src/ui/base.css \
  ../js_src/ui/button.css \
  ../js_src/ui/input.css \
  ../js_src/ui/dialog.css \
  ../js_src/ui/header/header.css \
  ../js_src/ui/footer/footer.css \
  ../js_src/landing/ui/landing.css \
  ../js_src/landing/ui/launcher/launcher.css
