
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
call js\build-card.bat
call js\build-deck-editor.bat
call js\build-deck-manager.bat
call js\build-game.bat
call js\build-landing.bat
call js\build-search.bat

echo Finished building everything.
