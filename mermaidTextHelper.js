

function mermaidTextGenerator(jsonObject){
    const textLines =[];
    textLines.push('flowchart TD');
    let genricObject = jsonGenericGenerator(jsonObject);
    textLines.push(`T[${genricObject.title}]`);
    genricObject.nodes.forEach(node=>{
        if((node.text?.includes('replaceAll') || node.text?.includes('replaceFirst') || node.text?.includes('split') || node.text?.includes('(') || node.text?.includes('[')) ){
            node.text = `"${node.text}"`;
        }
        if(node.type === 'roundEdge'){
            let line= `${node.id}(${node.text})`;
            textLines.push(line);
        }else if(node.type === 'roundedStadium'){
            let line= `${node.id}([${node.text}])`;
            textLines.push(line);
        }else if(node.type === 'subroutine'){
            let line= `${node.id}[[${node.text}]]`;
            textLines.push(line);
        }else if(node.type === 'trapezoidAlt'){
            let line= `${node.id}[\\${node.text}/]`;
            textLines.push(line);
        }else if(node.type === 'circle'){
            let line= `${node.id}((${node.text}))`;
            textLines.push(line);
        }else if(node.type === 'rectangle'){
            let line= `${node.id}[${node.text}]`;
            textLines.push(line);
        }else if(node.type === 'desicion'){
            let line= `${node.id}{${node.text}}`;
            textLines.push(line);
        }else if(node.type === 'hexagon'){
            let line= `${node.id}@{ shape: hex, label: ${node.text} }`;
            textLines.push(line);
        }else if(node.type === 'database'){
            let line= `${node.id}@{ shape: cyl, label: ${node.text} }`;
            textLines.push(line);
        }else if(node.type === 'stop'){
            let line= `${node.id}@{ shape: curv-trap, label: ${node.text} }`;
            textLines.push(line);
        }else if(node.type === 'subFlowStart'){
            let line= `subgraph ${node.id} [Try]`;
            let line2 =`style ${node.id} stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5`;
            textLines.push(line);
            textLines.push(line2);
        }else if(node.type === 'subFlowEnd'){
            let line= `end`;
            textLines.push(line);
        }else if(node.type === 'catchSubFlowStart'){
            let line= `subgraph ${node.id} [Catch]`;
            let line2 =`style ${node.id} stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5`;
            textLines.push(line);
            textLines.push(line2);
        }else if(node.type === 'finalSubFlowStart'){
            let line= `subgraph ${node.id} [Finally]`;
            let line2 =`style ${node.id} stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5`;
            textLines.push(line);
            textLines.push(line2);
        }else if(node.type === 'continue'){
               let line=   `${node.id}@{ shape: lin-rect, label: ${node.text} }`;
               textLines.push(line);
        }else if(node.type === 'break'){
               let line=   `${node.id}@{ shape: cross-circ, label: ${node.text} }`;
               textLines.push(line);
        }

        
        
    });
    genricObject?.edges?.forEach(edge=>{
        textLines.push(edge.label ? `${edge.from} --${edge.label}--> ${edge.to}`:`${edge.from} --> ${edge.to}`);
    });

    return textLines.join('\n');

}

function jsonGenericGenerator(jsonObject){
    let jsonGenericObject = {};
    let parameters = jsonObject.parameters.replace(/[()]/g, "").trim().length>0 ? jsonObject.parameters.replace(/[()]/g, "").trim() : 'None';
    parameters = parameters.includes('<') ? parameters.replaceAll('<',' of ') : parameters;
    parameters = parameters.includes('>') ? parameters.replaceAll('>',' = ') : parameters;
    parameters = parameters.includes(']') ? parameters.replaceAll(']',' Array ') : parameters;
    parameters = parameters.includes('[') ? parameters.replaceAll('[',' ') : parameters;
    jsonGenericObject['title'] = `Method : <b>${jsonObject.name}</b> </br> Parameters : ${parameters}`;
    jsonGenericObject['nodes'] =[];
    jsonGenericObject['edges'] =[];
    jsonGenericObject['totalNodes'] = 0;
    jsonGenericObject['idName'] = 'Node';
    jsonGenericObject['previousExitPoints'] =[];
    if(jsonGenericObject.totalNodes === 0){
        jsonGenericObject.nodes.push({id:'Node0', text:'Start', type:'roundedStadium'});
        jsonGenericObject.totalNodes = jsonGenericObject.totalNodes +1;
        jsonGenericObject.previousExitPoints.push('Node0');
    }

    jsonObject.body?.forEach(element => {
        parseJsonBody(element,jsonGenericObject);
    });
    return jsonGenericObject;
}

function parseJsonBody(body,jsonGenericObject){
    if(body.type === 'variable decleration'){
        let result=prepareVariableDeclarationLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
            
        });
        jsonGenericObject.nodes.push(result.node);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'Continue Statement'){
        let result=prepareContinueStamentLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
            
        });
        jsonGenericObject.nodes.push(result.node);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'Break Statement'){
        let result=prepareBreakStamentLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
            
        });
        jsonGenericObject.nodes.push(result.node);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'return statement'){
        let result = prepareReturnStatementLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
        });
        jsonGenericObject.nodes.push(result.node);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'Throw Exception'){
        let result = prepareThrowExpressionStatementLine(body,jsonGenericObject);
            jsonGenericObject.previousExitPoints?.forEach(ele=>{
                let edge ={};
                if(typeof ele === 'string'){
                    edge['from'] = ele;
                    edge['to'] = result.entryNode;
                    jsonGenericObject.edges.push(edge);
                }else if(ele){
                    edge['from'] = ele.id;
                    edge['label'] = ele.label;
                    edge['to'] = result.entryNode;
                    jsonGenericObject.edges.push(edge);
                }
            });
            jsonGenericObject.nodes.push(result.node);
            jsonGenericObject.previousExitPoints = result.exitNodes;
            jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'expression'){
            let result = prepareExpressionStatementLine(body,jsonGenericObject);
            jsonGenericObject.previousExitPoints?.forEach(ele=>{
                let edge ={};
                if(typeof ele === 'string'){
                    edge['from'] = ele;
                    edge['to'] = result.entryNode;
                    jsonGenericObject.edges.push(edge);
                }else  if(ele){
                    edge['from'] = ele.id;
                    edge['label'] = ele.label;
                    edge['to'] = result.entryNode;
                    jsonGenericObject.edges.push(edge);
                }
            });
            jsonGenericObject.nodes.push(result.node);
            jsonGenericObject.previousExitPoints = result.exitNodes;
            jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'desicion'){
        let result = prepareDesicionElementLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
            
        });
        jsonGenericObject.nodes.push(...result.node);
        jsonGenericObject.edges.push(...result.edges);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === "For loop"){
        let result = prepareForLoopElementLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
            
        });
        jsonGenericObject.nodes.push(...result.node);
        jsonGenericObject.edges.push(...result.edges);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'While loop'){
        let result = prepareWhileLoopElementLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
            
        });
        jsonGenericObject.nodes.push(...result.node);
        jsonGenericObject.edges.push(...result.edges);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'DML Operation'){
        let result = prepareDMLStatementLine(body,jsonGenericObject);
        jsonGenericObject.previousExitPoints?.forEach(ele=>{
            let edge ={};
            if(typeof ele === 'string'){
                edge['from'] = ele;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }else  if(ele){
                edge['from'] = ele.id;
                edge['label'] = ele.label;
                edge['to'] = result.entryNode;
                jsonGenericObject.edges.push(edge);
            }
            
        });
        jsonGenericObject.nodes.push(result.node);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }else if(body.type === 'Try Block'){
        let result = prepareTryBlock(body,jsonGenericObject);
        jsonGenericObject.nodes.push(...result.node);
        jsonGenericObject.edges.push(...result.edges);
        jsonGenericObject.previousExitPoints = result.exitNodes;
        jsonGenericObject['totalNodes'] = jsonGenericObject.totalNodes+1;
    }
}

function prepareTryBlock(body,jsonGenericObject){
    let node={};
    node['id'] = `${jsonGenericObject.idName}Start`+ jsonGenericObject.totalNodes;
    node['type'] = 'subFlowStart';
    let exitNodesId =[];
    let nodesFromBlocks=[];
    let nodesFromEdges=[];
    nodesFromBlocks.push(node);
    if(body.tryBlock){
        let tryGenericObject={};
        tryGenericObject['nodes']=[];
        tryGenericObject['edges']=[];
        tryGenericObject['totalNodes']=0;
        tryGenericObject['idName'] =`${node.id}`+`subTryNode`;
        tryGenericObject['previousExitPoints']=[];
        jsonGenericObject.previousExitPoints?.forEach(element=>{
            tryGenericObject.previousExitPoints.push(element);
            
        });
        parseJsonBlocks(body[`tryBlock`],tryGenericObject);
        nodesFromBlocks.push(...tryGenericObject.nodes);
        nodesFromEdges.push(...tryGenericObject.edges);
        let nodeEnd={};
        nodeEnd['id'] = `${jsonGenericObject.idName}End`+ jsonGenericObject.totalNodes;
        nodeEnd['type'] = 'subFlowEnd';
        nodesFromBlocks.push(nodeEnd);
        exitNodesId.push(...tryGenericObject.previousExitPoints);
    }
    for(let i=1;i<=body.catchBlocksCount;i++){
        let catchNode={};
        catchNode['id'] = `${jsonGenericObject.idName}Catch${i}Start`+ jsonGenericObject.totalNodes;
        catchNode['type'] = 'catchSubFlowStart';
        nodesFromBlocks.push(catchNode);
        let catchGenericObject={};
        catchGenericObject['nodes'] =[];
        catchGenericObject['edges'] =[];
        catchGenericObject['totalNodes'] =0;
        catchGenericObject['idName'] = `${catchNode.id}`+`subCatchNode`;
        let edge={};
        edge['from'] = node.id;
        edge['to'] = catchNode.id;
        edge['label']=body[`Catch${i}exceptionName`];
        nodesFromEdges.push(edge);
        catchGenericObject['previousExitPoints']=[];
        parseJsonBlocks(body[`Catch${i}Block`],catchGenericObject);
        nodesFromBlocks.push(...catchGenericObject.nodes);
        nodesFromEdges.push(...catchGenericObject.edges);
        let catchNodeEnd={};
        catchNodeEnd['id'] = `${jsonGenericObject.idName}Catch${i}End`+ jsonGenericObject.totalNodes;
        catchNodeEnd['type'] = 'subFlowEnd';
        nodesFromBlocks.push(catchNodeEnd);
        exitNodesId.push(...catchGenericObject.previousExitPoints);
    }
    if(body.finalBlock){
        let finalNode={};
        finalNode['id'] = `${jsonGenericObject.idName}FinalStart`+ jsonGenericObject.totalNodes;
        finalNode['type'] = 'finalSubFlowStart';
        nodesFromBlocks.push(finalNode);
        let finalGenericObject={};
        finalGenericObject['nodes'] =[];
        finalGenericObject['edges'] =[];
        finalGenericObject['totalNodes'] =0;
        finalGenericObject['idName'] = `${finalNode.id}`+`subCatchNode`;
        finalGenericObject['previousExitPoints']=[...exitNodesId];
        parseJsonBlocks(body['finalBlock'],finalGenericObject);
        nodesFromBlocks.push(...finalGenericObject.nodes);
        nodesFromEdges.push(...finalGenericObject.edges);
        let finalNodeEnd={};
        finalNodeEnd['id'] = `${jsonGenericObject.idName}FinalEnd`+ jsonGenericObject.totalNodes;
        finalNodeEnd['type'] = 'subFlowEnd';
        nodesFromBlocks.push(finalNodeEnd);
        exitNodesId.push(...finalGenericObject.previousExitPoints);
    }
    return {'node':nodesFromBlocks,'edges':nodesFromEdges,'exitNodes':exitNodesId,'entryNode':node.id};

}

function prepareDMLStatementLine(body,jsonGenericObject){
    let node={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    node['text'] =`${body.operationType} ${body.variableName}`;
    node['type'] ='database';
    let exitNodesId =[];
    exitNodesId.push(node.id);
    return {'node':node,'exitNodes':exitNodesId, 'entryNode':node.id};
}

function prepareVariableDeclarationLine(body,jsonGenericObject){
    let node={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    if(body.isSOQL){
        if(body.refType?.includes('List')){
            let obj = body.refType?.split('<')[1].split('>')[0];
            node['text'] = `SOQL Query on ${obj} is executed and assigned to ${body.variableName}`;
        }else{
            node['text'] = `SOQL Query on ${body.refType} is executed and assigned to ${body.variableName}`;
        }
        node['type'] = 'subroutine';
    }else if(body.isMethodcallout){
        node['text'] = `'${body.variableName}' is created with the result of ${body.methodDetails?.name}.`;
        node['type'] = 'trapezoidAlt';
    }else{
        node['text'] = `'${body.variableName}'  of type ${body.refType} Created.`;
        node['type'] = 'roundEdge'
    }

    let exitNodesId =[];
    exitNodesId.push(node.id);
    return {'node':node,'exitNodes':exitNodesId, 'entryNode':node.id};
}

function prepareContinueStamentLine(body,jsonGenericObject){
    let node ={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    node['text'] = body['text'];
    node['type'] = 'continue';
    let exitNodesId =[];
    return {'node':node,'exitNodes':exitNodesId, 'entryNode':node.id};
}

function prepareBreakStamentLine(body,jsonGenericObject){
    let node ={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    node['text'] = body['text'];
    node['type'] = 'break';
    let exitNodesId =[];
    return {'node':node,'exitNodes':exitNodesId, 'entryNode':node.id};
}

function prepareReturnStatementLine(body,jsonGenericObject){
    let node={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    let value = body.returnValue ? body.returnValue : 'Null';
    node['text'] = `Return ${value}`;
    node['type'] = 'roundedStadium';
    let exitNodesId=[];
    return {'node':node,'exitNodes':exitNodesId,'entryNode':node.id};
}

function prepareThrowExpressionStatementLine(body,jsonGenericObject){
    let node={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    node['text'] = `${body.text}`;
    node['type'] = 'stop';
    let exitNodesId=[];
    return {'node':node,'exitNodes':exitNodesId,'entryNode':node.id};
}

function prepareExpressionStatementLine(body,jsonGenericObject){
    let node={};
    if(body.subType === 'variable update'){
        node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
        if(body.isSOQL){
            node['text'] = `SOQL Query on '${body.fromObject}' executed and ${body.variableName} is updated.`;
            node['type'] = 'subroutine';
        }else if(body.isMethodcallout){
            node['text'] = `Method ${body.methodDetails?.name} is executed and ${body.variableName} is updated.`;
            node['type'] = 'trapezoidAlt';
        }else{
            node['text'] = `${body.variableName} is updated.`;
            node['type'] = `rectangle`;
        }
    }else if(body.subType === "Method Callout"){
        node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
        if(body.isDMLOperation){
            node['text'] =`${body.name}`;
            node['type']='database';
        }else if(body.recursive){
            node['text'] = `Method ${body.name} is executed. ⟳`;
            node['type'] = 'circle';
        }else{
            node['text'] = `Method ${body.name} is executed.`;
            node['type'] = 'trapezoidAlt';
        }
        
    }else if(body.subType === 'dotExpression' || body.subType === 'postOperation' || body.subType === 'preOperation'){
        node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
        if(body.isDMLOperation){
            node['text'] =`${body.line}`;
            node['type']='database';
        }else if(body.isSOQL){
            node['text'] =`SOQL Query Executed`;
            node['type']='subroutine';
        }else{
            node['text'] = `${body.line.split('(')[0]}`;
            node['type'] = `rectangle`;
        }
    }
    let exitNodesId =[];
    exitNodesId.push(node.id);
    return {'node':node,'exitNodes':exitNodesId,'entryNode':node.id};
}

function prepareDesicionElementLine(body,jsonGenericObject){
    let node ={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    node['text'] = `Desicion`;
    node['type'] = 'desicion';
    let exitNodesId =[];
    let nodesFromBlocks=[];
    let nodesFromEdges=[];
    nodesFromBlocks.push(node);
    if(body.ifBlock){
        let ifGenericObject={};
        ifGenericObject['nodes']=[];
        ifGenericObject['edges']=[];
        ifGenericObject['totalNodes']=0;
        ifGenericObject['idName'] =`${node.id}`+`subIfNode`;
        let edgeObj ={};
        edgeObj.id=node.id;
        edgeObj.label = body.ifCondition;
        ifGenericObject['previousExitPoints']=[edgeObj];
        parseJsonBlocks(body[`ifBlock`],ifGenericObject);
        nodesFromBlocks.push(...ifGenericObject.nodes);
        nodesFromEdges.push(...ifGenericObject.edges);
        exitNodesId.push(...ifGenericObject.previousExitPoints);
    }
    for(let i=0;i<body.elseIfCounter;i++){
         let subGenericObject ={};
         subGenericObject['nodes']=[];
         subGenericObject['edges']=[];
         subGenericObject['totalNodes']=0;
         subGenericObject['idName'] =`${node.id}`+`subElseIfNode${i}`;
         let edgeObj ={};
         edgeObj.id=node.id;
         edgeObj.label = body[`elseIfConditon${i+1}`];
         subGenericObject['previousExitPoints'] = [edgeObj];
         parseJsonBlocks(body[`elseIfConditon${i+1}Block`],subGenericObject);
         nodesFromBlocks.push(...subGenericObject.nodes);
         nodesFromEdges.push(...subGenericObject.edges);
         exitNodesId.push(...subGenericObject.previousExitPoints);
    }
    if(body.elseBlock){
        let elseGenericObject={};
        elseGenericObject['nodes']=[];
        elseGenericObject['edges']=[];
        elseGenericObject['totalNodes']=0;
        elseGenericObject['idName'] =`${node.id}`+`subElse`;
        let edgeObj ={};
        edgeObj.id=node.id;
        edgeObj.label = 'else';
        elseGenericObject['previousExitPoints'] = [edgeObj];
        parseJsonBlocks(body[`elseBlock`],elseGenericObject);
        nodesFromBlocks.push(...elseGenericObject.nodes);
        nodesFromEdges.push(...elseGenericObject.edges);
        exitNodesId.push(...elseGenericObject.previousExitPoints);
    }else{
        let edgeObj ={};
        edgeObj.id=node.id;
        edgeObj.label = 'else';
        exitNodesId.push(edgeObj);
    }
    return {'node':nodesFromBlocks,'edges':nodesFromEdges,'exitNodes':exitNodesId,'entryNode':node.id};
}

function prepareWhileLoopElementLine(body,jsonGenericObject){
    let node ={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    node['text'] = `${body.whileCondition}`;
    node['type'] = 'hexagon';
    let exitNodesId =[];
    let nodesFromBlocks=[];
    let nodesFromEdges=[];
    nodesFromBlocks.push(node);
    let forGenericObject ={};
    forGenericObject['nodes']=[];
    forGenericObject['edges']=[];
    forGenericObject['totalNodes']=0;
    forGenericObject['idName'] =`${node.id}`+`whileLoop`;
    let ele ={};
    ele.id = node.id;
    ele.label ='For-Each';
    forGenericObject['previousExitPoints'] = [ele];
    parseJsonBlocks(body.whileBlock,forGenericObject);
    nodesFromBlocks.push(...forGenericObject.nodes);
    nodesFromEdges.push(...forGenericObject.edges);
    forGenericObject.previousExitPoints?.forEach(element=>{
        let edge ={};
        if(typeof element === 'string'){
            edge['from'] = element;
            edge['to'] = node.id;
            nodesFromEdges.push(edge);
        }else{
            edge['from'] = element.id;
            edge['label'] = element.label;
            edge['to'] = node.id;
            nodesFromEdges.push(edge);
        }
    });
    let finalEdge={}
    finalEdge.id=node.id;
    finalEdge.label = 'After-Last';
    exitNodesId.push(finalEdge);
    return {'node':nodesFromBlocks,'edges':nodesFromEdges,'exitNodes':exitNodesId,'entryNode':node.id};
}

function prepareForLoopElementLine(body,jsonGenericObject){
    let node ={};
    node['id'] = `${jsonGenericObject.idName}`+ jsonGenericObject.totalNodes;
    node['text'] = `${body.forCondition}`;
    node['type'] = 'hexagon';
    let exitNodesId =[];
    let nodesFromBlocks=[];
    let nodesFromEdges=[];
    nodesFromBlocks.push(node);
    let forGenericObject ={};
    forGenericObject['nodes']=[];
    forGenericObject['edges']=[];
    forGenericObject['totalNodes']=0;
    forGenericObject['idName'] =`${node.id}`+`forLoop`;
    let ele ={};
    ele.id = node.id;
    ele.label ='For-Each';
    forGenericObject['previousExitPoints'] = [ele];
    parseJsonBlocks(body.forBlock,forGenericObject);
    nodesFromBlocks.push(...forGenericObject.nodes);
    nodesFromEdges.push(...forGenericObject.edges);
    forGenericObject.previousExitPoints?.forEach(element=>{
        let edge ={};
        if(typeof element === 'string'){
            edge['from'] = element;
            edge['to'] = node.id;
            nodesFromEdges.push(edge);
        }else{
            edge['from'] = element.id;
            edge['label'] = element.label;
            edge['to'] = node.id;
            nodesFromEdges.push(edge);
        }
    });
    let finalEdge={}
    finalEdge.id=node.id;
    finalEdge.label = 'After-Last';
    exitNodesId.push(finalEdge);
    return {'node':nodesFromBlocks,'edges':nodesFromEdges,'exitNodes':exitNodesId,'entryNode':node.id};
}

function parseJsonBlocks(block,jsonGenericObject){
    if(block && Array.isArray(block)){
        block.forEach(element=>{
            parseJsonBody(element,jsonGenericObject);
        });
    }
    return jsonGenericObject;
}

module.exports = mermaidTextGenerator;