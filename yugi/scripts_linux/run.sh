
echo ___________________________________________
echo Creating symbolic links
rm ../war/closure
rm ../war/js_externs
rm ../war/js_generated
rm ../war/js_src
ln -s /home/james/workspaces/yugi/Yugioh/closure/ ../war/closure
ln -s /home/james/workspaces/yugi/Yugioh/js_externs/ ../war/js_externs
ln -s /home/james/workspaces/yugi/Yugioh/js_generated/ ../war/js_generated
ln -s /home/james/workspaces/yugi/Yugioh/js_src/ ../war/js_src

echo ___________________________________________
echo -e "Running Yugioh locally...\n"

/home/james/programs/eclipse/plugins/com.google.appengine.eclipse.sdkbundle_1.6.4.v201203300216r37/appengine-java-sdk-1.6.4/bin/dev_appserver.sh \
  --port=8888 /home/james/workspaces/yugi/Yugioh/war/

echo ___________________________________________
echo -e "Server shut down successfully.\n"
