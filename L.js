var environment = {
  '+' : (args) => args.reduce((sum,currentValue) => sum + currentValue),

  '-' : (args) => args.reduce((sum,currentValue) => sum - currentValue),

  '*' : (args) => args.reduce((sum,currentValue) => sum * currentValue),

  '/' : (args) => args.reduce((sum,currentValue) => sum / currentValue),

  '>' : (args) => args[0] > args[1] ? true : false,

  '<' : (args) => args[0] < args[1] ? true : false,

  '>=' : (args) => args[0] >= args[1] ? true : false,

  '>' : (args) => args[0] >= args[1] ? true : false,

  'true' : true,

  'false' : false,

  'pi' : 3.14
}


function parseEvaluate( data ){
  let value
  console.log( data ,'in Parsevalue')
  if( data[0] !== '(' ){
    if( data[0] in environment && typeof environment[data[0]] !== 'function' ) return environment[data.shift()] //Variable reference
    else if( Number(data[0]) === Number(data[0])) return Number(data.shift()) //Number
    else{
    console.log("Syntax Error! : " + data[0] + " Invalid")
    process.exit();
    }
  }
  if( data[1] === '(' ){
    console.log("Syntax error at the opening of the expression")
    process.exit()
  }
  data.shift()
  while( data[0] !== ')' ){
    console.log(data,'in loop')
  if( data[0] === 'define' ){
    data.shift()
    let property = data[0]
    data.shift()
    environment[property] = value = parseEvaluate(data)
    console.log(property + " : " + value + " Updated to the global environment!")
    console.log(data,'in define')
    //data.shift()
    console.log(data,'in define')
  }
  else if( data[0] === 'quote'){
    data.shift()
    if( data[0] !== '(' && data[0] !== ')' ) return data.shift()
    else if( data[0] === ')' ){
      console.log("Invalid Quote")
      process.exit(0)
    }
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
      console.log(asItIs)
      if( count === 0 ) return asItIs.join(" ")
      else{
        console.log("Invalid Quote Syntax")
        process.exit()
      }
    }
  }
  else if( data[0] === 'set!' ){
    data.shift()
    let variable = data[0]
    data.shift()
    if( variable in environment ){
      environment[variable] = parseEvaluate(data)
      console.log("The global variable " + variable + " is now : " + environment[variable])
      //return 'unspecified'   //This is because the result of set! expression is unspecified
      console.log(data)
    }
    else{
      console.log("The variable " + variable + " is not a global variable")
      process.exit()
    }
  }
  else if( data[0] === 'begin' ) data.shift()
  else if( data[0] === '('){
    value = parseEvaluate( data )
    //data.shift()
  }
  else if( data[0] === 'if' ){
    data.shift()
    if( parseEvaluate(data) === true ){
      value = parseEvaluate(data) //evaluate this
    }
    else value = parseEvaluate(data) // in case of false, evaluate this
  }
  else if( typeof environment[data[0]] === 'function' ){
    let args = [], fn = environment[data[0]]
    data.shift()
    while( data[0] !== ')' ){
      args.push(parseEvaluate(data))
    }//end of inner while
    data.shift()

    value = fn(args)
    console.log(value, 'value after function')
    console.log(data)
    return fn(args)
  }
  else{
    console.log("Err! Error in the Expression, '" + data[0] + "' not found")
    process.exit();
  }
}//end of outer while
  data.shift();
  if( data.length === 0 )
  return value

}

const getTokens = data => data.replace(/[(]/g, "( ").replace(/[)]/g, " )").split(/[" "]+/)

console.log(parseEvaluate(getTokens("(     +   1      2) (+ 2 3) )")))
//console.log(getTokens("(+ 1 2) )"))
