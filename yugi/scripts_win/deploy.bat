
@echo off

echo.
call rmsymlinks.bat

echo.
echo ___________________________________________
echo Deploying Yugioh to AppEngine...
echo.

"C:\Program Files\eclipse\plugins\com.google.appengine.eclipse.sdkbundle_1.7.3\appengine-java-sdk-1.7.3\bin\appcfg.cmd" ^
  update C:\Users\james\workspaces\yugi\yugi\war\

echo.
echo ___________________________________________
echo Deployment finished.
echo.
