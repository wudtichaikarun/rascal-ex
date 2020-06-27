console.log('*******class decorators*******')
function classDecoratorLog(name) {
  return function decorator(Class) {
    return (...args) => {
      console.log(`Arguments for ${name}: ${args}`)
      return new Class(...args)
    }
  }
}

@classDecoratorLog('example-class-decorator')
class Baz {
  constructor(name, age) {}
}

const baz = new Baz('test1', 'test2')
