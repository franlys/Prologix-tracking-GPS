FROM traccar/traccar:latest

# Copiar configuración personalizada
COPY traccar.xml /opt/traccar/conf/traccar.xml

# Exponer puertos
# 8082 - API Web
# 5001 - GPS103/Coban protocol
# 5013 - GT06 protocol
# 5023 - TK103 protocol
EXPOSE 8082 5001 5013 5023

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8082/api/server || exit 1
