FROM traccar/traccar:latest

# Copy config template
COPY traccar.xml /opt/traccar/conf/traccar.xml.template

# Entrypoint script: substitute env vars into config, then start Traccar
RUN printf '#!/bin/sh\n\
cp /opt/traccar/conf/traccar.xml.template /opt/traccar/conf/traccar.xml\n\
sed -i "s|TRACCAR_DB_URL_PLACEHOLDER|${TRACCAR_DB_URL}|g" /opt/traccar/conf/traccar.xml\n\
sed -i "s|TRACCAR_DB_USER_PLACEHOLDER|${TRACCAR_DB_USER}|g" /opt/traccar/conf/traccar.xml\n\
sed -i "s|TRACCAR_DB_PASSWORD_PLACEHOLDER|${TRACCAR_DB_PASSWORD}|g" /opt/traccar/conf/traccar.xml\n\
exec java -jar /opt/traccar/lib/tracker-server.jar /opt/traccar/conf/traccar.xml\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8082 5001 5013 5023

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8082/api/server || exit 1

ENTRYPOINT ["/entrypoint.sh"]
