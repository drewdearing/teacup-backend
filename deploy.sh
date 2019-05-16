cd app
sudo npm run-script build
cp -r build/* ../firebase/public/
cd ../firebase
firebase deploy