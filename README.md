**Apex Viz (MVP)**

Apex Flowchart Generator is an offline VS Code extension visual Aid tool that converts Apex code into structured, flowchart-style diagrams similar to Salesforce Flows.
It helps Salesforce developers, administrators, and newbies to visually understand complex Apex logic structure.

**Key Features**

It detect and visualizes the following:
1. for loops.
2. While loops.
3. If/Else Statements.
4. Method callout.
5. SOQL and DML Operations.
6. Try catch Finally Blocks.
7. Throw Statements.
8. Variables declaration and updates.
9. Continue, Break Statements.
10. Return Statements

**Flowchart Visualization**

1. Generates Mermaid flowchart syntax.
2. Renders diagrams directly inside VS Code.
3. Similar visual structure to Salesforce Flows.

**Vs Code Commands**

`ApexViz: Visualize Apex Class` - Helps to visualize Apex Class, Extracts All the methods and Visualize these methods individually.

**Usage**

1. Open any Apex Class `.cls`
2. Run the Command.
3. Web View will be opened.
4. Select any Method and click on visualize, mermaid diagram will be rendered.

**Limitations**

1. Focused only on  structural flow (not variable tracking).
2. Does not evaluate runtime behavior.
3. `Switch` `Case` logic is currently not rendered.
4. Triggers can't be visualized.
5. Ternary operator(Short-hand if else) is not being visualized.
6. Constructors are skipped.
7. Complex dynamic Apex may require future enhancements.
8. Long text in the rendered Mermaid diagram may be truncated. As a temporary workaround, copy the generated Mermaid code and view it in any Mermaid-supported tool.

**Privacy**

1. Completely Offline.
2. No External API Calls.
3. Your Code never leaves your machine.

**Architecture**

Apex Class Code -> Apex ANTLR4 Praser -> AST and Code Structure Extraction -> Mermaid Flow Chart Synatx Generation -> VS Code Webview Rendering.


