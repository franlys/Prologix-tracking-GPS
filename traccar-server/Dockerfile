FROM traccar/traccar:latest

# Overwrite config with one that has placeholders
COPY traccar.xml /opt/traccar/conf/traccar.xml.template

# At build time, create a wrapper that substitutes env vars then calls
# the original image entrypoint (/opt/traccar/bin/entry.sh or similar)
RUN echo '#!/bin/sh' > /init.sh \
 && echo 'cp /opt/traccar/conf/traccar.xml.template /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'sed -i "s|TRACCAR_DB_URL_PLACEHOLDER|${TRACCAR_DB_URL}|g" /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'sed -i "s|TRACCAR_DB_USER_PLACEHOLDER|${TRACCAR_DB_USER}|g" /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'sed -i "s|TRACCAR_DB_PASSWORD_PLACEHOLDER|${TRACCAR_DB_PASSWORD}|g" /opt/traccar/conf/traccar.xml' >> /init.sh \
 && echo 'exec "$@"' >> /init.sh \
 && chmod +x /init.sh

EXPOSE 8082 5001 5013 5023

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8082/api/server || exit 1

# Use init.sh as a wrapper that passes through to the original CMD
ENTRYPOINT ["/init.sh"]
CMD ["/opt/traccar/bin/entry.sh"]
