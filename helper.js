
let currentMethodName='';

function extractMethods(tree) {
  let classObj ={};
  classObj['name']='';
  const methods = [];

  function visit(node) {
    if (!node) return;
    let returnType='void';
    let methodName='';
    let parameters=[];
    let body='';
    let modifiers=[];
    if (node.constructor.name === "MethodDeclarationContext") {
      if(node?.parentCtx?.parentCtx?.constructor.name === 'ClassBodyDeclarationContext'){
            const anon = node.parentCtx.parentCtx.children.filter(element=> {
                return element.constructor.name=== 'ModifierContext'
            });
            if(anon.length>0){
                anon.forEach(e=> modifiers.push(e.getText() ? e.getText() : ''));
            }
      }
      if (node.children) {
        node.children.forEach(child => {
          
          const childName = child.constructor.name;
          const text = child.getText ? child.getText() : "";

          if (childName === "TypeRefContext") {
            returnType =  text;
          }

          if (childName === "IdContext") {
            methodName = text;
            currentMethodName =text;
          }

          if (childName === "FormalParametersContext") {
            parameters = text;
          }

          if (childName === "BlockContext") {
            let statements=[];
            child?.children?.forEach(async (ele)=>{
              await parseBodyLine(ele,statements);
            });
            body = statements;
          }
        });

      }

      methods.push({
        'name': methodName,
        'returnType': returnType,
        'parameters': parameters,
        'modifiers': modifiers,
        'body': body
      });
    }

    if (node.children) {
      node.children.forEach(visit);
    }
  }

  visit(tree);
  return methods;
}

function parseBodyLine(node,statements){
    
    const childName = node.constructor.name;
    if(childName === 'StatementContext'){
       node?.children?.forEach(nod=>{ 
        parseStatementContext(nod,statements);
       });
    }
}


function parseStatementContext(node,stementsLinesObjects){
    const nodeName= node.constructor.name;
    if(nodeName === 'ExpressionStatementContext'){
      let expressionObject = {};
      expressionObject['type']='expression';
      expressiveStatementContext(node,expressionObject);
      stementsLinesObjects.push(expressionObject);
    }else if(nodeName === 'IfStatementContext'){
      let ifObject ={};
      ifObject['ifCondition'] ='';
      ifObject['elseIfCounter'] =0;
      ifObject['type'] = 'desicion';
      parseIfLogic(node,ifObject);
      stementsLinesObjects.push(ifObject);
    }else if(nodeName === 'ForStatementContext'){
      let forObject={};
      forObject['type'] ='For loop';
      forObject['forCondition']='';
      parseForLogic(node,forObject);
      stementsLinesObjects.push(forObject);
    }else if(nodeName === 'WhileStatementContext'){
      let whileObject={};
      whileObject['type'] ='While loop';
      whileObject['whileCondition']='';
      parseWhileLogic(node,whileObject);
      stementsLinesObjects.push(whileObject);
    }else if(nodeName === 'LocalVariableDeclarationStatementContext'){
      let varObject={};
      varObject['type'] = 'variable decleration';
      parseVariablelogic(node,varObject);
      stementsLinesObjects.push(varObject);

    }else if(nodeName === 'ReturnStatementContext'){
      let returnObject = {};
      returnObject['type'] = 'return statement';
      parseReturnlogic(node,returnObject);
      stementsLinesObjects.push(returnObject);
    }else if(nodeName === 'UpdateStatementContext' || nodeName === 'InsertStatementContext' || nodeName === 'DeleteStatementContext' || nodeName === 'UpsertStatementContext'){
      let dmlObject ={};
      dmlObject['type'] = 'DML Operation';
      parseDMLlogic(node,dmlObject);
      stementsLinesObjects.push(dmlObject);
    }else if(nodeName === 'TryStatementContext'){
      let tryObject={};
      tryObject['type'] = 'Try Block';
      tryObject['catchBlocksCount']=0;
      parseTryBlock(node,tryObject);
      stementsLinesObjects.push(tryObject);
    }else if(nodeName === 'ThrowStatementContext'){
        let throwObject={};
        throwObject['type'] = 'Throw Exception';
        parseThrowStatementContext(node,throwObject);
        stementsLinesObjects.push(throwObject);
    }
    return stementsLinesObjects;

}

function parseTryBlock(node, tryObject){
     let tryStatements =[];
    node.children?.forEach(element=>{
      const name = element?.constructor?.name;
      if(name === 'BlockContext'){
        element?.children?.forEach(sub=>{
          parseBodyLine(sub,tryStatements);
        });
      }
      if(name === 'CatchClauseContext'){
        tryObject.catchBlocksCount = tryObject.catchBlocksCount+1;
        element?.children?.forEach(ele=>{
          const grandName = ele?.constructor?.name;
          if(grandName === 'QualifiedNameContext'){
            tryObject[`Catch${tryObject.catchBlocksCount}exceptionName`] = ele.getText();
          }else if(grandName === 'BlockContext'){
            let catchStatements =[];
            ele?.children?.forEach(e=>{
              parseBodyLine(e,catchStatements);
            });
            tryObject[`Catch${tryObject.catchBlocksCount}Block`]=catchStatements;
          }

        });
        
      }
      if(name === 'FinallyBlockContext'){
        element?.children?.forEach(sub=>{
          if(sub?.constructor?.name === 'BlockContext'){
              let finalStatements =[];
              sub?.children?.forEach(ele=>{
                parseBodyLine(ele,finalStatements);
              });
              tryObject['finalBlock'] = finalStatements;
          }
        });
      }
    });
    tryObject['tryBlock'] = tryStatements;
    return;
}

function parseDMLlogic(node, dmlObject){
  dmlObject['operationType'] = node?.children[0]?.getText();
  dmlObject['variableName'] = node?.children[1]?.getText();
}

function parseReturnlogic(node,returnObject){
  for(let i=0; i<node.children?.length;i++ ){
    const name= node.children[i]?.constructor.name;
    if(name === 'PrimaryExpressionContext'){
      if(node.children[i]?.children[0]?.constructor.name === 'IdPrimaryContext'){
         returnObject['returnValue'] = node.children[i].getText();
      }
      parsePrimaryExpressionContext(node.children[i],returnObject);
    }else if(name === 'DotExpressionContext'){
        returnObject['returnValue'] = node.children[i].getText();
    }else if(name === 'CastExpressionContext'){
        returnObject['returnValue'] = node.children[i].getText();
    }else if(name === 'Arth2ExpressionContext'){
      returnObject['returnValue'] = 'Arth Expression';
    }else if(name === 'MethodCallExpressionContext'){
      returnObject['returnValue'] = node.children[i].getText();
    }
  }
}

function parseVariablelogic(node, varObject){
    for(let i=0; i<node.children?.length;i++){
      const name= node.children[i]?.constructor.name;
      if(name === 'LocalVariableDeclarationContext'){
          node.children[i]?.children?.forEach(element=>{
            if(element?.constructor?.name === 'TypeRefContext'){
              varObject['refType'] = element?.getText();
            }else if(element?.constructor?.name === 'VariableDeclaratorsContext'){
              parseVariableDeclarators(element,varObject);
            }
            
          });
      }
    }
}

function parseVariableDeclarators(node,varObject){
  const subChild = node?.children[0];
  if(subChild?.constructor?.name === 'VariableDeclaratorContext'){
    subChild?.children?.forEach(ele=>{
        const contextName = ele?.constructor?.name;
        if(contextName === 'IdContext'){
            varObject['variableName'] = ele?.getText();
        }else if(contextName === 'DotExpressionContext'){
            varObject['varaibaleAssigmentContext'] = contextName;
        }else if(contextName === 'PrimaryExpressionContext'){
            parsePrimaryExpressionContext(ele,varObject);
        }else if(contextName === 'MethodCallExpressionContext'){
            varObject['isMethodcallout'] = true;
            let methodSubObject={};
            parseMethodExpressionNode(ele,methodSubObject);
            varObject['methodDetails'] = methodSubObject;
        }
    });
  }
}

function parsePrimaryExpressionContext(node,varObject){
  const grandChild = node?.children[0];
  if(grandChild?.constructor?.name === 'SoqlPrimaryContext'){
      varObject['isSOQL'] = true;
      if(grandChild?.children[0]?.constructor.name === 'SoqlLiteralContext'){
        if(grandChild?.children[0]?.children[1]?.constructor?.name === 'QueryContext'){
            const lastgen = grandChild?.children[0]?.children[1];
            lastgen?.children?.forEach(last=>{
              if(last.constructor?.name === 'FromNameListContext'){
                varObject['fromObject'] = last?.getText();
              }
            });
        }
      }
  }
}

function parseAssignmentExpressionContext(node,expressionObject){
  expressionObject['subType'] = 'variable update';
  node.children?.forEach(ele=>{
    const name = ele.constructor.name;
    if(name === 'PrimaryExpressionContext'){
      if(ele.children[0]?.constructor.name === 'IdPrimaryContext'){
        if(!expressionObject['variableNameUpdated']){
          expressionObject['variableName'] = ele.getText();
          expressionObject['variableNameUpdated'] = true;
        }
         
      }
      parsePrimaryExpressionContext(ele,expressionObject);
     
    }else if(name === 'MethodCallExpressionContext'){
      expressionObject['isMethodcallout'] = true;
      let methodSubObject={};
      parseMethodExpressionNode(ele,methodSubObject);
      expressionObject['methodDetails'] = methodSubObject;
    }else if(name === 'DotExpressionContext'){
      if(!expressionObject['variableNameUpdated']){
        expressionObject['variableName'] = ele.getText();
        expressionObject['variableNameUpdated'] = true;
      }
    }
  });
}
function expressiveStatementContext(node, expressionObject){
  for(let i=0; i<node.children?.length; i++){
    const name = node.children[i]?.constructor?.name;
    if(name== 'MethodCallExpressionContext'){
        parseMethodExpressionNode(node.children[i],expressionObject);
    }else if(name === 'AssignExpressionContext'){
        parseAssignmentExpressionContext(node.children[i],expressionObject);
    }else if(name === 'DotExpressionContext'){
        parseDotExpressionNode(node.children[i],expressionObject);
    }else if(name === 'PostOpExpressionContext'){
        parsePostopExpressionContext(node.children[i],expressionObject);
    }else if(name === 'PreOpExpressionContext'){
        parsePreopExpressionContext(node.children[i],expressionObject);
    }else if(name != 'Fe'){
      expressionObject['line'] = node.getText();
    }
  }

}

function parseThrowStatementContext(node,jsonObject){
    jsonObject['subType'] ='throwStatement';
    jsonObject['text'] = node.getText();
}
function parsePreopExpressionContext(node,jsonObject){
  jsonObject['subType'] ='preOperation';
  jsonObject['line'] = node.getText();
}
function parsePostopExpressionContext(node,jsonObject){
    jsonObject['subType'] ='postOperation';
    jsonObject['line'] = node.getText();
}

function parseDotExpressionNode(node,jsonObject){
  jsonObject['subType'] = 'dotExpression';
  jsonObject['line'] = node.getText();
  if(node.getText().includes('Database') && !node.getText().includes('.query')){
    jsonObject['isDMLOperation'] = true;
  }else if(node.getText().includes('Database') && node.getText().includes('.query')){
    jsonObject['isSOQL'] = true;
  }
}

function parseMethodExpressionNode(node,jsonObject){
  jsonObject['subType'] = 'Method Callout';
  jsonObject['line'] = node.getText();
  let callOutName = node.getText()?.split("(")[0];
  jsonObject['name'] = callOutName;
  if(callOutName.includes('.')){
    jsonObject['className'] = callOutName.split('.')[0];
  }
  if(jsonObject['className'] && jsonObject['className'] === 'Database'){
    jsonObject['isDMLOperation'] = true;
  }else{
    jsonObject['isDMLOperation'] = false;
  }
  let methName =  node.getText()?.split("(")[0]?.includes('.') ? node.getText()?.split("(")[0]?.split('.')[1] : node.getText()?.split("(")[0] ;
  if(currentMethodName === methName){
    jsonObject['recursive'] = true;
  }else{
    jsonObject['recursive'] = false;
  }
}

function parseWhileLogic(node,whileObject){
    for(let i=0; i<node.children?.length;i++){
        const name= node.children[i]?.constructor?.name;
        if(name==='ParExpressionContext'){
          whileObject.whileCondition = node.children[i]?.getText();
        }else if(name === 'StatementContext'){
          let whileStatements =[];
          node.children[i]?.children[0]?.children.forEach(async (child)=>{
              await parseBodyLine(child,whileStatements);
          });

          whileObject['whileBlock'] = whileStatements;
        }
    }
}

function parseForLogic(node, forObject){
    for(let i=0; i<node.children?.length; i++){
       const name= node.children[i]?.constructor?.name;
       if(name=== 'ForControlContext'){
         forObject.forCondition = node.children[i]?.getText();
       }else if(name === 'StatementContext'){
          let forStatements = [];
          node.children[i]?.children[0]?.children.forEach(async (child)=>{
              await parseBodyLine(child,forStatements);
          });
          
          forObject['forBlock'] = forStatements;
       }
    }
}

function parseIfLogic(node,ifObject){
  
  let elseExpressionnode=[];
    for(let i=0; i<node.children.length-1 ; i++ ){
        if(node.children[i]?.getText()=='else' && node.children[i+1]){
          elseExpressionnode.push(node.children[i+1]);
        }
        if(node.children[i]?.constructor?.name === 'ParExpressionContext'){
          let conditon = node?.children[i]?.getText();
          if(ifObject.ifCondition.length>0){
              let nextCounter = ifObject.elseIfCounter +1;
              let parameterString = 'elseIfConditon' + nextCounter;
              let parameterStringBlock = parameterString+'Block';
              ifObject[parameterString] = conditon;
              let elseIfBlockStatements =[];
              node.children[i+1]?.children[0]?.children?.forEach(async (child)=>{
                 await parseBodyLine(child,elseIfBlockStatements);
              });
              ifObject[parameterStringBlock] = elseIfBlockStatements;
              ifObject.elseIfCounter = nextCounter;
          }else{
            ifObject.ifCondition=conditon;
            let statementsIf=[];
            node.children[i+1]?.children[0]?.children?.forEach(async (child)=>{
                 await parseBodyLine(child,statementsIf);
            });
            ifObject['ifBlock'] = statementsIf;
          }
        }
    }
    elseExpressionnode?.forEach(ele=>{
        flattenOutElseMethod(ele,ifObject);
    });
}
function flattenOutElseMethod(node, ifObject){
    for(let i=0;i<node.children?.length;i++){
      const name= node.children[i]?.constructor?.name;
      if(name=== 'IfStatementContext'){
         return parseIfLogic(node.children[i],ifObject);
      }
      if(name=== 'BlockContext'){
        let statementsElse =[];
        node.children[i]?.children?.forEach(async(ele)=>{
            await parseBodyLine(ele,statementsElse)
        });
        ifObject['elseBlock'] = statementsElse;
        return;
      }
    }
}
module.exports = extractMethods;
