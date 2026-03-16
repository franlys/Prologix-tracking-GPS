FROM traccar/traccar:latest

# Copy config template
COPY traccar.xml /opt/traccar/conf/traccar.xml.template

# Wrapper script: substitute env vars, then start Traccar with its bundled JRE
RUN echo '#!/bin/sh' > /init.sh \
 && echo 'cp /opt/traccar/conf/traccar.xml.template /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'sed -i "s|TRACCAR_DB_URL_PLACEHOLDER|${TRACCAR_DB_URL}|g" /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'sed -i "s|TRACCAR_DB_USER_PLACEHOLDER|${TRACCAR_DB_USER}|g" /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'sed -i "s|TRACCAR_DB_PASSWORD_PLACEHOLDER|${TRACCAR_DB_PASSWORD}|g" /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'exec /opt/traccar/jre/bin/java -Xms512m -Xmx512m -Djava.net.preferIPv4Stack=true -jar /opt/traccar/tracker-server.jar /opt/traccar/conf/traccar.xml' >> /init.sh \
 && chmod +x /init.sh

EXPOSE 8082 5001 5013 5023

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8082/api/server || exit 1

ENTRYPOINT ["/init.sh"]
