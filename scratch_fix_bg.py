import glob
import re

files = glob.glob(r'c:\Users\igorj\Desktop\githubio\js\posts\ref-001\*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Plotly explicitly sets paper_bgcolor and plot_bgcolor
    # Let's replace any rgba(255, 255, 255, 1) or #fff or #ffffff with transparent
    
    # We can also add a highly specific CSS block just in case
    css = """<style>
        body, html { background-color: transparent !important; }
        .js-plotly-plot .plotly .bg { fill: transparent !important; }
        .js-plotly-plot .plotly .plotbg { fill: transparent !important; }
        .js-plotly-plot .plotly .paper-bg { fill: transparent !important; }
        rect.bg { fill: transparent !important; }
    </style>"""
    
    if "rect.bg { fill: transparent !important; }" not in content:
        content = content.replace("</head>", css + "\n</head>")
        
    # Replace json backgrounds
    content = re.sub(r'"paper_bgcolor":"[^"]+"', '"paper_bgcolor":"rgba(0,0,0,0)"', content)
    content = re.sub(r'"plot_bgcolor":"[^"]+"', '"plot_bgcolor":"rgba(0,0,0,0)"', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Fixed {f}")
