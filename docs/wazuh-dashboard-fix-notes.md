# Wazuh Dashboard Login Loop Fix

Added to opensearch_dashboards.yml:
- opensearch_security.cookie.secure: false
- opensearch_security.cookie.password: "<32+ char random string>"
