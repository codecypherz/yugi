
@echo off

echo Running the linter...
call linter.bat

echo Generating the soy template JS...
call soy.bat

echo Generating deps.js...
call gen-deps.bat

echo Generating the CSS...
call gss.bat

echo Build all JS...
cd js
call build-card.bat
call build-deck-editor.bat
call build-deck-manager.bat
call build-game.bat
call build-landing.bat
call build-search.bat
cd ..

echo Finished building everything.
