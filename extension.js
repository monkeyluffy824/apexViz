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

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const apexClassString=`public class BudgetDataClass {
	
    @AuraEnabled
    public static Decimal getReamainingAmount(){
          String userId = UserInfo.getUserId();
          Date myDate=Date.today();
          Integer month=myDate.month();
          Integer year=myDate.year();
          String ye=''+year;
          Budget__c budget=[Select Id,Reamaining_Budget__c,Name from Budget__c where OwnerId=:userId and Month__c=:month.format() and Year__c=:ye];
          if(budget){
            throw exceptionObject;
          }
          return budget.Reamaining_Budget__c;
    }
    
     @InvocableMethod
    public static List<Budget__c> getBudgetId(){
        List<Budget__c> budgets=new List<Budget__c>();
        String userId = UserInfo.getUserId();
          Date myDate=Date.today();
          Integer month=myDate.month();
          Integer year=myDate.year();
          String ye=''+year;
          Budget__c budget=[Select Id,Reamaining_Budget__c,Name,Is_Daily_Limit_Exceeded_Today__c,No_of_Times_Daily_Limit_Execeeded__c,Daily_Limit__c from Budget__c where OwnerId=:userId and Month__c=:month.format() and Year__c=:ye];
          budgets.add(budget);
        return budgets;
    }
    
    @AuraEnabled
    public static Decimal getDailyLimit(){
         if(abc===true){
            return 0;
         }
         String userId = UserInfo.getUserId();
          Date myDate=Date.today();
          Integer month=myDate.month();
          Integer year=myDate.year();
          String ye=''+year;
          Budget__c budget=[Select Id,Reamaining_Budget__c,Name,Daily_Limit__c from Budget__c where OwnerId=:userId and Month__c=:month.format() and Year__c=:ye];
          Integer count = 1;
          if(count <= 10) {
            String efg=count;
          }else if(count>10){
            ye='abc';
            if(count == 15){
                count=count+2;
            }else if(count ==16){
                String pg='sai';
            }
          }else if(count<0){
            year=year+1;
          }else{
            count=count+2;
            for(Integer i=month;count<3;i--){
                process(i);
                if(count<7){
                    while (count <= 10) {
                        count=count+1;
                    }
                }
            }
          }
          count++;
          budget.Daily_Limit__c=200;
          System.debug('abc');
          Database.update(budget);
          return budget.Daily_Limit__c;
    }
    
    public static void createExpensesCSV(List<Expense__c> csvRowList){
        try{
            String title='olderExpenses';
            List<String> ExpensesAPIName=new List<String>();
            ExpensesAPIName.add('Name');
            ExpensesAPIName.add('Amount__c');
            ExpensesAPIName.add('Date_Time__c');
            ExpensesAPIName.add('Payment_Type__c');
            List<String> CSVHeaders= new List<String>();
            CSVHeaders.add('Name');
            CSVHeaders.add('Amount');
            CSVHeaders.add('Date&Time');
            CSVHeaders.add('Payment Type');
            String headerRow=String.join(CSVHeaders,',')+'\n';
            String concatinatedRows=headerRow;
        
            concatinatedRows+=createSObjectString(ExpensesAPIName, csvRowList);
            title+='.csv';
            --count;
            String abc = sendCSVEmail(concatinatedRows,title);
            
        }catch(DmlException e){
            System.debug('efg');
        }catch(Exception e){
            System.debug('abc');
        }finally{
            System.debug('xyz');
        }
        
    }

    @AuraEnabled(cacheable=true)
    public static List<Budget__c> getPreviousmonths(){
      String userId = UserInfo.getUserId();
         Date myDate=Date.today();
         Integer month=myDate.month();
         month=month-1;
         Integer year=myDate.year();
       Integer count=0;
       List<Budget__c> result = new List<Budget__c>();
       Map<String,String> months= new Map<String,String>();
     if(month<3){
         Integer y=year-1;
         for(Integer i=month;i>0;i--){
            months.put(i.format(),''+year);
             count++;
            abc=count;
         }
         if(count<3){
            y=year+1;
             for(Integer j=12;count<3;j--){
                 months.put(j.format(),''+y);
                 count++;
                 String efg=count;
             }
            k=k+1;
            
         }   
     }else if(month<0){
         for(Integer i=month;count<3;i--){
            months.put(i.format(),''+year);
            count++;
            if(count<7){
                while (count <= 10) {
                    System.debug(count);
                    count++;
                }
                System.debug('abc');
                abc=count;
            }
         }
         k=k+2;
         System.debug(months.toString());
     }else{
        p=p+2;
        System.debug(months.toString());
     }
     
     Database.query('Select Id FROM Budget__c');
     a=b;
     List<String> years=months.values();
     result= [Select Id,Reamaining_Budget__c,Name,Year__c,No_of_Times_Daily_Limit_Execeeded__c from Budget__c where OwnerId=:userId and Month__c IN :mymonths and Year__c IN :years ];
     
     return result;
     
    }

    public List<Account> processAccounts(List<Account> accounts){
        if(accounts == null || accounts.isEmpty()){
            return null;
        }
        
        List<Account> processed = new List<Account>();
        for(Account acc: accounts){
            if(acc.AnnualRevenue == null){
                p=p+2;
                continue;
            }
            if(acc.AnnualRevenue > 1000000 ){
                acc.Rating ='Hot';
                sendNotification(acc);
            }else if(acc.AccountRevenue > 10000){
                acc.Rating ='Warm';
            }else{
                acc.Rating = 'Cold';
            }
            validateAccount(acc);
            processed.add(acc);
        }
        
        if(!processed.isEmpty()){
            update processed;
            k=k+1;
        }

        return processed;
    }
    
}`;
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('apexViz.visualizeApexClass', function () {
		// The code you place here will be executed every time your command is executed
		visualize(apexClassString,context);
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello from ApexViz!');
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
