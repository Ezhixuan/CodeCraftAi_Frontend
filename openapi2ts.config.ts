export default {
  requestLibPath: "import request from '@/request'",
  schemaPath: 'http://localhost:8911/api/v3/api-docs',
  serversPath: './src',
  namespace: 'API',

  hook: {
    customType: (schemaObject, namespace, originGetType) => {
      const type = originGetType(schemaObject, namespace)
      console.log(type)
      const isLongType = schemaObject.type === 'integer' && schemaObject.format === 'int64'
      if (isLongType) {
        return 'string'
      }
      return originGetType(schemaObject, namespace)
    },
  },
}
