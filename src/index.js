import R from 'ramda'

const obj = {
  a: {
    b: 'hello',
  },
}

function sayHello() {
  const message = R.path(['a', 'b'], obj)

  console.log(message)
}

sayHello()
