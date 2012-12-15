
@echo off
echo Building all CSS

cd gss
call build-card-gss.bat
call build-deck-editor-gss.bat
call build-deck-manager-gss.bat
call build-game-gss.bat
call build-landing-gss.bat
call build-search-gss.bat
cd ..

echo Finished building all CSS
