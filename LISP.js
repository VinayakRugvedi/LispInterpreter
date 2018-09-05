var repl = require('repl')
var readline = require('readline')

var environment = {
  '+' : (args) => args.reduce((sum,currentValue) => sum + currentValue),

  '-' : (args) => args.reduce((sum,currentValue) => sum - currentValue),

  '*' : (args) => args.reduce((sum,currentValue) => sum * currentValue),

  '/' : (args) => args.reduce((sum,currentValue) => sum / currentValue),

  '>' : (args) => args[0] > args[1] ? true : false,

  '<' : (args) => args[0] < args[1] ? true : false,

  '>=' : (args) => args[0] >= args[1] ? true : false,

  '>' : (args) => args[0] >= args[1] ? true : false,

  '=' : (args) => args[0] === args[1] ? true : false,

  'true' : true,

  'false' : false,

  'pi' : 3.14
}

var envts = [environment]

function throwError( data ){
  console.log(data)
  process.exit()
}


function parseEvaluate( data , envt = environment){
  var value
  console.log( data[0] ,'in Parsevalue')
  if( data[0] !== '(' ){
    if( data[0] in envt && typeof envt[data[0]] !== 'function' ) return envt[data.shift()] //Variable reference
    else if( Number(data[0]) === Number(data[0])) return Number(data.shift()) //Number
    throwError("Syntax Error! : '" + data[0] + "' is Invalid")
  }
  /*if( data[1] === '(' ){
    console.log("Syntax error at the opening of the expression")
    process.exit()
  }
  */
  data.shift()
  while( data[0] !== ')' ){
    console.log(data,'in loop')
  if( data[0] === 'define' ){
    data.shift()
    let property = data[0]
    data.shift()
    console.log(data, 'value of data for value in define')
    //value = parseEvaluate(data, envt)
    envt[property] = value = parseEvaluate(data, envt)
    console.log(property + " : " + value + " Updated to the global envt!")
    console.log(data,'in define')
    //data.shift()
    console.log(data,'in define')
  }
  else if( data[0] === 'quote'){
    data.shift()
    if( data[0] !== '(' && data[0] !== ')' ) return data.shift()
    else if( data[0] === ')' ) throwError("Invalid Quote")
    else{
      console.log(data,'data coming in else quote')
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
      }//end of quote while
      //console.log(asItIs)
      if( count === 0 ) value = asItIs.join(" ")
      else throwError("Invalid Quote Syntax")
    }
  }
  else if( data[0] === 'set!' ){
    data.shift()
    let variable = data[0]
    data.shift()
    if( variable in envt ){
      envt[variable] = parseEvaluate(data, envt)
      console.log("The global variable " + variable + " is now : " + envt[variable])
      //return 'unspecified'   //This is because the result of set! expression is unspecified
      console.log(data)
    }
    else throwError("The variable " + variable + " is not a global variable")
  }
  else if( data[0] === 'lambda' ) value = lambdaParser( data )
  else if( data[0] === 'begin' ) data.shift()
  else if( data[0] === '('){
    value = parseEvaluate( data , envt)
    //data.shift()
  }
  else if( data[0] === 'if' ){
    data.shift()
    if( parseEvaluate(data, envt) === true ) value = parseEvaluate(data, envt) //evaluate this
    else value = parseEvaluate(data) // in case of false, evaluate this
  }
  else if( typeof envt[data[0]] === 'function' ){
    let args = [], fn = envt[data[0]]
    data.shift()
    while( data[0] !== ')' ){
      args.push(parseEvaluate(data, envt))
    }//end of inner while
    data.shift()

    value = fn(args)
    console.log(value, 'value after function')
    console.log(data)
    return fn(args)
  }
  else if( typeof envt[data[0]] === 'string' ){
    let expression = envt[data[0]]
    value =
    //console.log(expression)
    //console.log(Object.keys(envt).length)
    //console.log(Object.keys(envts[0]).length)
    //data.shift()
    //console.log(data, 'data for lambda')
  }
  else throwError("Err! Error in the Expression, '" + data[0] + "' not found")
}//end of outer while
  data.shift();
  //if( data.length === 0 )
  return value

}

function lambdaParser( data ){
  data.shift()
  //Forming the scope w.r.t the arguments
  if( data[0] !== '(' ) throwError("Syntax error w.r.t argumental appearance in lambda ")
  data.shift()
  let inner_env = {}
  console.log(inner_env, 'inner env before using')
  while( data[0] !== ')' && data.length !== 0 ){
    inner_env[data[0]] = null
    data.shift()
  }
  if( data.length === 0 ) throwError("Error w.r.t lambda's arguments - No body found")
  data.shift();
  console.log("Arguments are scoped!")
  envts.unshift(inner_env)
  console.log(inner_env, 'after using')

  if(data[0] !== '(' ) throwError("Error - Improper body of lambda ")

  let lambdaExpression = [], count = 1;
  lambdaExpression.push(data[0])
  data.shift()
  console.log(data, 'data before loop lambda')
  while( count > 0 && data !== [] ){
    if( data[0] === ')' ){
      count--
      lambdaExpression.push(data[0])
      data.shift()
    }
    else if( data[0] === '(' ){
      count++
      lambdaExpression.push(data[0])
      data.shift()
    }
    else{
      lambdaExpression.push(data[0])
      data.shift()
    }
  } //end of while
  console.log(lambdaExpression,'exression lambda')
  console.log(data,'data after expression')
  if( count === 0 )
    return lambdaExpression.join(" ")
  throwError("Improper Body Syntax")
}

const getTokens = data => data.replace(/[(]/g, "( ").replace(/[)]/g, " )").split(/[" "]+/)

console.log(parseEvaluate(getTokens("((define circle-area (lambda (r) (* pi (* r r)))) (circle-area 10))")))
//console.log(parseEvaluate(getTokens("(begin (define r 10) (* pi (* r r)))")))
//console.log(parseEvaluate(getTokens('}')))
/*var replServer = repl.start({
  prompt : "Lisp-Interpreter : "
});

function sendToParseEvaluate( cmd ){
  data = `${cmd}`
  parseEvaluate(data)
}*/
