To update or download the latest corda-tools-network-bootstrapper go to https://software.r3.com/artifactory/corda-releases/net/corda/ and download the version you want.


To run java, we need to set the JAVAHOME and PATH so that any sub processes calling java will use the correct runtime environment.

Example:
```bash
JAVA_HOME=~/Work/ganache/integrations/corda/java/OpenJDK/OpenJDK8U-jre_x64_linux_hotspot_8u232b09 PATH=$JAVA_HOME/bin:$PATH java -jar corda-tools-network-bootstrapper-4.3.jar --dir corda
```
