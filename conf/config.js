let requireOrEnvOrDefault = function (moduleName, envName, defaultValue) {
  try {
    return require(moduleName)
  } catch (e) {
    try {
      return process.env[envName] ? JSON.parse(process.env[envName]) : defaultValue
    } catch (err) {
      return defaultValue
    }
  }
}

module.exports = {
  'amqp' : requireOrEnvOrDefault('./amqp.json', 'AMQP_CONF',
    {"type" : process.env['AMQP_TYPE'] || "rabbitmq", "url" : process.env['AMQP_URL'] || "amqp://rabbitmq-server"}),
  'memstore' : requireOrEnvOrDefault('./memstore.json', 'MEMSTORE_CONF',
    {
      "type" : process.env['MEMSTORE_TYPE'] || "redis",
      "url" : process.env['MEMSTORE_URL'] || "redis://redis-server:6379/1",
      "dir": process.env['MEMSTORE_DIR'] || "./memsdata"
    }),
  'storage' : requireOrEnvOrDefault('./storage.json', 'STORAGE_CONF',
    {
      "api_hostname" : process.env['STORAGE_API_HOSTNAME'] || "http://bigstream-server:19080",
      "repository" : process.env['STORAGE_REPOSITORY'] || "/var/bigstream/data"
    }),
  'auth' : {
    'secret': requireOrEnvOrDefault('./secret.json', 'AUTH_SECRET_CONF',
      {
        "type": process.env['AUTH_SECRET_TYPE'] || "text",
        "value": process.env['AUTH_SECRET_VALUE'] || "bigstream-server"
      }),
    'acl' : requireOrEnvOrDefault('./acl.json', 'AUTH_ACL_CONF', [{"accept":true}])
  }
}
