
let selectedMethodName ='';
let mermaidText='';
const vscode = acquireVsCodeApi();

mermaid.initialize({ startOnLoad: false,theme: 'dark',securityLevel: "loose", flowchart: {htmlLabels: true} });
    window.addEventListener('message', event => {
        const msg = event.data;
        if(msg.command === 'methodNames'){
            const paraTextTag = document.getElementById('paraText');
            const items = document.getElementById('dropdownValues');
            const methNames = msg.methods;
            const para = document.createElement('p');
            if(methNames.length>0){
                methNames?.forEach(element => {
                    const option= document.createElement("option");
                    option.text=element;
                    option.value =element;
                    items.appendChild(option);
                });
                para.innerText  = "Apex Class Parsed Successfully, Select the method from below dropdown and click on visulaize button."
            }else{
                para.innerText  = "Apex Class Parsed Successfully, and it doesnt have any methods."
            }
            
            para.style = "font-size: 15px;color:aquamarine;";
            paraTextTag.appendChild(para);
        }
        if (msg.command === 'renderMermaid') {
            setTimeout(() => {
            const container = document.getElementById('diagram');
                container.innerHTML = '';
                mermaidText = msg.text;
                mermaid.render('graph1', msg.text).then(({ svg }) => {
                    container.innerHTML = svg;
                });
        },100);
            setTimeout(() => {
                    const svgConatiner = document.getElementById('diagram');
                    const svg = svgConatiner.querySelector('svg');
                    if (svg) {
                        svgConatiner.style.height = '1000px'
                        svg.removeAttribute('width');
                        svg.removeAttribute('height');
                        svg.style.width = '100%';
                        svg.style.height = '1000px';
                    svgPanZoom(svg, {
                        viewportSelector: '.svg-pan-zoom_viewport'
                        , panEnabled: true
                        , controlIconsEnabled: true
                        , zoomEnabled: true
                        , dblClickZoomEnabled: true
                        , mouseWheelZoomEnabled: true
                        , preventMouseEventsDefault: true
                        , zoomScaleSensitivity: 0.2
                        , minZoom: 0.5
                        , maxZoom: 10
                        , fit: false
                        , contain: false
                        , center: true
                        , refreshRate: 'auto'
                    });
                    }
            }, 500);
        }
    });

const select = document.getElementById('dropdownValues');
const visulaize = document.getElementById('startVisualizeButton');
const copyTextButton =  document.getElementById('mermaidTextClipboardButton');
select.addEventListener('change', (e) => {
    if(e.target.value?.length>0){
        selectedMethodName = e.target.value;
        
        visulaize.style.display = selectedMethodName.length>0 ? "inline-block" : "none";
    }else{
        visulaize.style.display = "none";
    }
    const time = document.getElementById('mermaidTextClipboard');
    time.style.display = "none";
});

visulaize.addEventListener('click',()=>{
    vscode.postMessage({
      command: 'requestMermaid',
      text: selectedMethodName
    });
    const time = document.getElementById('mermaidTextClipboard');
    time.style.display = "inline-block";
});

copyTextButton.addEventListener('click', (ele) => {
     navigator.clipboard.writeText(mermaidText)
      .then(() => {
        vscode.postMessage({
            command: 'mermaidTextCipboard'
        });
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
   
});