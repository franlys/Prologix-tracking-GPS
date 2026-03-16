#!/bin/sh
set -e

# Substitute env vars into traccar config
cp /opt/traccar/conf/traccar.xml.template /opt/traccar/conf/traccar.xml

sed -i "s|TRACCAR_DB_URL_PLACEHOLDER|${TRACCAR_DB_URL}|g" /opt/traccar/conf/traccar.xml
sed -i "s|TRACCAR_DB_USER_PLACEHOLDER|${TRACCAR_DB_USER}|g" /opt/traccar/conf/traccar.xml
sed -i "s|TRACCAR_DB_PASSWORD_PLACEHOLDER|${TRACCAR_DB_PASSWORD}|g" /opt/traccar/conf/traccar.xml

# Find and run the original traccar entrypoint
if [ -f /opt/traccar/bin/entry.sh ]; then
  exec /opt/traccar/bin/entry.sh
elif [ -f /entrypoint.sh ]; then
  exec /entrypoint.sh
else
  # Fallback: find java and run directly
  JAVA=$(find / -name "java" -type f 2>/dev/null | head -1)
  exec "$JAVA" -jar /opt/traccar/lib/tracker-server.jar /opt/traccar/conf/traccar.xml
fi
