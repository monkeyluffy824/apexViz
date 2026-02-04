// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const antlr4 = require('antlr4');
const praser = require('@apexdevtools/apex-parser');
const extractor = require('./helper');
const textGenerator = require('./mermaidTextHelper');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const disposable = vscode.commands.registerCommand('apexViz.visualizeApexClass', function () {
		// The code you place here will be executed every time your command is executed
        try{
            const editor = vscode.window.activeTextEditor;
            if(editor){
                const content = editor.document.getText();
                const fileName = editor.document.uri.path.split('/').pop();
                if(fileName && fileName?.endsWith('.cls')){
                    visualize(content,context);
                    vscode.window.showInformationMessage('Hello from ApexViz!');
                }else{
                    vscode.window.showInformationMessage('Run this command after opening the apex class!');
                }
            }
        }catch(err){
            console.log('error occured',err);
        }
        
	});

	context.subscriptions.push(disposable);
}
function visualize(apexClassString,context){
	const input = new praser.CaseInsensitiveInputStream(apexClassString);
		const lexer = new praser.ApexLexer(input);
		const tokens = new antlr4.CommonTokenStream(lexer);
		const parse = new praser.ApexParser(tokens);
		const tree = parse.compilationUnit();
		const methods = extractor(tree);
        let methodNames=[];
        methods.forEach(method=>{
            methodNames.push(method.name);
        });
       
		// Display a message box to the user
        const panel = vscode.window.createWebviewPanel(
                    'myWebview',
                    'Apex Viz',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
						retainContextWhenHidden: true,
                        localResourceRoots: [
                            vscode.Uri.joinPath(context.extensionUri, 'ui')
                        ]
                    }
                );
        panel.webview.html = getWebviewHtml(panel.webview, context);
        setTimeout(()=>{
            panel.webview.postMessage({
                command: 'methodNames',
                methods: methodNames
            });
        },50);
        panel.webview.onDidReceiveMessage(message=>{
            if(message.command === 'requestMermaid'){
                let requestedName = message.text;
                const methodObj = methods.filter(method=> method.name === requestedName);
                if(methodObj?.length>0){
                    let mermaidText = textGenerator(methodObj[0]);
                    panel.webview.postMessage({
                        command: 'renderMermaid',
                        text: mermaidText,
                    });
                }
                
            }
            if(message.command === 'mermaidTextCipboard'){
                vscode.window.showInformationMessage('Mermaid Text copied to clipboard!');
            }
        });
        function getWebviewHtml(webview, context) {
                const htmlPath = vscode.Uri.joinPath(
                    context.extensionUri,
                    'ui',
                    'view.html'
                );
                let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
                const mediaUri = webview.asWebviewUri(
                    vscode.Uri.joinPath(context.extensionUri, 'ui')
                );
                html = html.replace(/{{UI_URI}}/g, mediaUri.toString());
                return html;
    }
}
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
