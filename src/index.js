// @flow
import R from 'ramda'

const obj = {
  a: {
    b: 'hello',
  },
}

function sayHello(): string {
  const message = R.path(['a', 'b'], obj)

  return message
}
sayHello()

interface IRequest {
  methodA(): void;
  methodB(): void;
  methodC(): void;
}

class Request implements IRequest {}
