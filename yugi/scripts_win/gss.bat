
@echo off
echo Building all CSS

call gss\build-card-gss.bat
call gss\build-deck-editor-gss.bat
call gss\build-deck-manager-gss.bat
call gss\build-game-gss.bat
call gss\build-landing-gss.bat
call gss\build-search-gss.bat

echo Finished building all CSS
