
echo Generating admin search.css...
java -jar ../../Closure/gss/closure-stylesheets-20111118.jar \
  --output-file ../war/css/admin/search.css \
  ../js_src/ui/mixin.css \
  ../js_src/ui/base.css \
  ../js_src/ui/button.css \
  ../js_src/ui/input.css \
  ../js_src/ui/dialog.css \
  ../js_src/ui/selection/selection.css \
  ../js_src/ui/search/search.css \
  ../js_src/admin/ui/admin.css \
  ../js_src/admin/search/ui/search.css
