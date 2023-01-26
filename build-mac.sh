export CERT=certs/osx.p12;
export CSC_LINK=$CERT;
export NOTARIZE=false;

export CSC_KEY_PASSWORD=$PASSWORD;
export CSC_KEYCHAIN=ganache.ui.build.keychain;
export KEYCHAIN_PASS=$RANDOM.$RANDOM.$RANDOM;
security delete-keychain $CSC_KEYCHAIN;

security create-keychain -p $KEYCHAIN_PASS $CSC_KEYCHAIN;
security default-keychain -s $CSC_KEYCHAIN;
security unlock-keychain -p $KEYCHAIN_PASS $CSC_KEYCHAIN;
security import $CERT -k $CSC_KEYCHAIN -P $CSC_KEY_PASSWORD -T /usr/bin/codesign;
security set-keychain-settings $CSC_KEYCHAIN;

echo "Setting key partition list";
security set-key-partition-list -S "apple-tool:,apple:,codesign:" -s -k $KEYCHAIN_PASS $CSC_KEYCHAIN;

npm run build-mac
unset CERT;
