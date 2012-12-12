
echo -e "\n"
./rmsymlinks.sh

echo -e "\n"
echo ___________________________________________
echo -e "Deploying Yugioh to AppEngine...\n"

/home/james/programs/eclipse/plugins/com.google.appengine.eclipse.sdkbundle_1.6.4.v201203300216r37/appengine-java-sdk-1.6.4/bin/appcfg.sh \
  update /home/james/workspaces/yugi/Yugioh/war/

echo -e "\n"
echo ___________________________________________
echo -e "Deployment finished.\n"
