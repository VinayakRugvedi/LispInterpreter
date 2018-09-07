var environment = {
  '+' : (args) => args.reduce((sum,currentValue) => sum + currentValue),

  '-' : (args) => args.reduce((sum,currentValue) => sum - currentValue),

  '*' : (args) => args.reduce((sum,currentValue) => sum * currentValue),

  '/' : (args) => args.reduce((sum,currentValue) => sum / currentValue),

  '>' : (args) => args[0] > args[1] ? true : false,

  '<' : (args) => args[0] < args[1] ? true : false,

  '>=' : (args) => args[0] >= args[1] ? true : false,

  '<=' : (args) => args[0] <= args[1] ? true : false,

  '>' : (args) => args[0] >= args[1] ? true : false,

  '=' : (args) => args[0] === args[1] ? true : false,

  'true' : true,

  'false' : false,

  'pi' : 3.14,

  'outer' : null
}

var envts = [environment] //Array of environments --> Left to Right
                          //Innermost Environment at left

function throwError( data ){ //Logging all error scenarios and terminating
  console.log(data)
  process.exit()
}

function parseEvaluate( data , envt = environment){
  var value
  if( data[0] !== '(' ){
    if((variable = findTheVariable(data[0], envts[0]))){ // Variable reference
      data.shift()
      return variable
    }
    else if( Number(data[0]) === Number(data[0])) return Number(data.shift()) //Number
    throwError("Syntax Error! : '" + data[0] + "' is Invalid")
  }
  data.shift() //Removing ' ( '
  while( data[0] !== ')' ){
    if( data[0] === 'define' ){
      data.shift()
      let property = data[0]
      data.shift()
    if( data[1] !== 'lambda') envt[property] = value = parseEvaluate(data, envt)
    else{
      data.shift()
      envt[property] = value = lambdaParser( data, envt)
      data.shift()
      }
    console.log(property + " : " + value + " Updated to the global envt!")
    }
    else if( data[0] === 'quote'){
      data.shift()
      if( data[0] !== '(' && data[0] !== ')' ) return data.shift()
      else if( data[0] === ')' ) throwError("Invalid Quote")
      else value = getLiteralExpression( data )
    }
    else if( data[0] === 'set!' ){ //Should rework
      data.shift()
      let variable = data[0]
      data.shift()
      if( variable in envt ){
        envt[variable] = parseEvaluate(data, envt)
        console.log("The global variable " + variable + " is now : " + envt[variable])
      }
      else throwError("The variable " + variable + " is not a global variable")
    }

    else if( data[0] === 'lambda' ){
      value = lambdaParser( data, envt) //for direct evaluation
      data.shift()
      let noOfParameters = Object.keys(envts[0].parameters).length
      let params = Object.keys(envts[0].parameters)
      let paramIndex = 0
      while( noOfParameters !== 0 ){
        envts[0].parameters[params[paramIndex++]] = parseEvaluate(data)
        noOfParameters--
      }
      value = parseEvaluate(getTokens(value), envts[0])
      data.push(')')
    }

    else if( data[0] === 'begin' ) data.shift()
    else if( data[0] === '('){
      value = parseEvaluate( data , envt)
      //data.shift()
    }
    else if( data[0] === 'if' ){
      data.shift()
      if( parseEvaluate(data, envt) === true ){
        value = parseEvaluate(data, envt)
        break
      }
      else{
        parseEvaluate(data, envt)
        if( data[0] === 'oops' )  break
        value = parseEvaluate(data, envt)
        break
      }
    }
  //find the function
    else if( typeof (findTheFunction(data[0], envt)) === 'function' ){
      let fn = findTheFunction(data[0], envt)
      let args = []
      data.shift()
      while( data[0] !== ')' ){
        args.push(parseEvaluate(data, envt))
      }
      data.shift()
      value = fn(args)
      return ( fn(args) )
    }
    else if( typeof (findTheBody(data[0], envt)) === 'string' ){
      let expression = findTheBody(data[0], envt)
      data.shift()
      let noOfParameters = Object.keys(envts[0].parameters).length
      let params = Object.keys(envts[0].parameters)
      let paramIndex = 0
      while( noOfParameters !== 0 ){
        envts[0].parameters[params[paramIndex++]] = parseEvaluate(data)
        noOfParameters--
      }
      value = parseEvaluate(getTokens(expression), envts[0])
      }
      else throwError("Err! Error in the Expression, '" + data[0] + "' not found")
  }//end of outer while
    data.shift();
    return value
}

function findTheFunction( data, envt ){
  if( data in envt && typeof envt[data] === 'function' ) return envt[data]
  while( envt['outer'] !== null ){
    envt = envt['outer']
    if( data in envt && typeof envt[data] === 'function' ) return envt[data]
  }
  return false
}

function findTheBody( data, envt ){
  if( data in envt && typeof envt[data] === 'string' ) return envt[data]
  while( envt['outer'] !== null ){
    envt = envt['outer']
    if( data in envt && typeof envt[data] === 'string' ) return envt[data]
  }
  return false
}

function findTheVariable( data, envt ){
  if( data in envt && typeof envt[data] !== 'function') return envt[data]
  else if( envt['parameters'] ){
    if( data in envt['parameters'])
    return envt['parameters'][data]
  }
  while( envt['outer'] !== null ){
    envt = envt['outer']
    if( data in envt && typeof envt[data] !== 'function') return envt[data]
    else if( envt['parameters'] ){
      if( data in envt['parameters'])
      return envt['parameters'][data]
    }
  }
  return false
}

function getLiteralExpression(data){
  let count = 1, asItIs = []
  asItIs.push(data[0]); data.shift()
  while( count > 0 && data !== [] ){
    if( data[0] === ')' ){
      count--
      asItIs.push(data[0])
      data.shift()
    }
    else if( data[0] === '(' ){
      count++
      asItIs.push(data[0])
      data.shift()
    }
    else{
      asItIs.push(data[0])
      data.shift()
    }
  }
  if( count === 0 ) return (asItIs.join(" "))
  else throwError("Invalid Syntax at : " + asItIs.join(" "))
}

function lambdaParser( data, envt){
  data.shift()
  //Forming the scope w.r.t the arguments
  if( data[0] !== '(' ) throwError("Syntax error w.r.t argumental appearance in lambda ")
  data.shift()
  let inner_env = {}
  let parameters = {}
  while( data[0] !== ')' && data.length !== 0 ){
    parameters[data[0]] = null
    data.shift()
  }
  inner_env['parameters'] = parameters
  if( data.length === 0 ) throwError("Error w.r.t lambda's arguments - No body found")
  data.shift();
  console.log("Arguments are scoped!")
  envts.unshift(inner_env)
  if(data[0] !== '(' ) throwError("Error - Improper body of lambda ")
    inner_env['body'] = getLiteralExpression( data, envt )
    inner_env['outer'] = envt
    return inner_env['body']
}

const getTokens = data => data.replace(/[(]/g, "( ").replace(/[)]/g, " )").split(/[" "]+/)

console.log("Test case : 1 ")
console.log(parseEvaluate(getTokens("(+ 1 10)"))) //1
console.log()
console.log("Test case : 2 ")
console.log(parseEvaluate(getTokens("(+ 4 (* 5 6))"))) //2
console.log()
console.log("Test case : 3 ")
console.log(parseEvaluate(getTokens("(begin (define r 10) (* pi (* r r)))"))) //3
console.log()
console.log("Test case : 4 ")
console.log(parseEvaluate(getTokens("(if (> (* 11 11) 120) (* 7 6) (+ 1 1))"))) //4
console.log()
console.log("Test case : 5 ")
console.log(parseEvaluate(getTokens("((lambda (x) (+ x x)) 4)"))) //5
console.log()
console.log("Test case : 6 ")
console.log(parseEvaluate(getTokens("((lambda (x y z) (+ x (* y z))) 4 5 6)"))) //6
console.log()
console.log("Test case : 7 ")
console.log(parseEvaluate(getTokens("(define circle-area (lambda (r) (* pi (* r r))) circle-area 10)"))) //7
console.log()
console.log("Test case : 8 ")
console.log(parseEvaluate(getTokens("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))) fact 10)"))) //8
console.log()
console.log("Test case : 9 ")
console.log(parseEvaluate(getTokens("(define compose (lambda (f g) (lambda (x) (f (g x)))))"))) //9
