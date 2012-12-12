
@echo off
gjslint ^
  -r ../js_src ^
  --closurized_namespaces="goog,yugi" ^
  --strict ^
  --check_html
