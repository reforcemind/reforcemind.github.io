import { researchData } from './data.js?v=15';
import { mountDiagrams } from './sketch-diagram.js?v=9';

let selectedId = null;

window.toggleSidebar = function() {
    const sidebar = document.getElementById('research-sidebar');
    const toggleIcon = document.getElementById('toggle-icon');
    const collapsed = !document.body.classList.contains('sidebar-collapsed');
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    if (sidebar) sidebar.classList.toggle('is-collapsed', collapsed);
    if (toggleIcon) toggleIcon.innerText = collapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left';
}

function loadData() {
    const countEl = document.getElementById('entries-count');
    const listEl = document.getElementById('research-list');
    const detailEl = document.getElementById('research-detail');

    if (countEl) countEl.innerText = `${researchData.length < 10 ? '0' : ''}${researchData.length} ENTRIES`;

    if (!researchData.length) {
        if (listEl) {
            listEl.innerHTML = '<p class="px-6 py-8 text-sm text-on-surface-variant">No entries yet.</p>';
        }
        if (detailEl) {
            detailEl.innerHTML = `
                <div class="max-w-2xl mx-auto w-full py-16 paper-sheet">
                    <p class="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-4">Archive</p>
                    <h1 class="font-headline-lg text-4xl mb-4">Nothing published here yet.</h1>
                    <p class="text-on-surface-variant text-lg leading-relaxed">Notes and papers will land in this index when they are ready. FlowEdge and NetForge are on the product pages.</p>
                </div>
            `;
        }
        return;
    }

    renderList();
    const fromHash = decodeURIComponent(location.hash.replace('#', ''));
    const initial = researchData.find(d => d.id === fromHash) || researchData[0];
    selectItem(initial.id);
}

function renderList() {
    const listEl = document.getElementById('research-list');
    listEl.innerHTML = researchData.map(item => `
        <div class="master-list-item ${selectedId === item.id ? 'active' : ''} px-3 py-2 hairline-b border-ink-black flex flex-col relative group cursor-pointer" onclick="selectItem('${item.id}')">
            <div class="flex justify-between items-baseline mb-0.5">
                <span class="text-[10px] font-technical-sm ${selectedId === item.id ? 'opacity-70' : 'text-on-surface-variant'} tracking-widest uppercase">${item.id}</span>
                <span class="text-[10px] font-technical-sm ${selectedId === item.id ? 'opacity-70' : 'text-on-surface-variant'} uppercase">${item.date}</span>
            </div>
            <h3 class="text-sm font-headline-md leading-tight ${selectedId === item.id ? 'group-hover:text-parchment-base' : 'text-ink-black'}">${item.title}</h3>
            <p class="text-[10px] font-technical-sm ${selectedId === item.id ? 'opacity-60' : 'text-on-surface-variant'} mt-0.5 truncate">${item.authors}</p>
        </div>
    `).join('');
}

window.selectItem = function(id) {
    selectedId = id;
    renderList();
    history.replaceState(null, '', `#${id}`);
    
    const item = researchData.find(d => d.id === id);
    if(!item) return;

    const detailEl = document.getElementById('research-detail');
    const isSidebarHidden = document.body.classList.contains('sidebar-collapsed');
    const toggleIconText = isSidebarHidden ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left';
    const essay = item.format === "substack";

    const links = `
        ${item.links?.pdf ? `<a href="${item.links.pdf}" target="_blank" rel="noopener">arXiv</a>` : ""}
        ${item.links?.github ? `<a href="${item.links.github}" target="_blank" rel="noopener">NetForge_RL</a>` : ""}
    `;

    if (essay) {
        detailEl.innerHTML = `
            <article class="essay">
                <div class="essay-top">
                    <button type="button" onclick="toggleSidebar()" class="essay-toggle" title="Toggle Sidebar">
                        <span id="toggle-icon" class="material-symbols-outlined text-xl">${toggleIconText}</span>
                    </button>
                    <p class="essay-kicker">${item.type} · ${item.readMinutes || 10} min read</p>
                </div>
                <h1>${item.title}</h1>
                ${item.dek ? `<p class="essay-dek">${item.dek}</p>` : ""}
                <p class="essay-byline">
                    <span>${item.fullAuthors}</span>
                    <span>${item.publishedDate}</span>
                    <span class="essay-links">${links}</span>
                </p>
                <div id="markdown-content" class="essay-body"></div>
            </article>
        `;
    } else {
        detailEl.innerHTML = `
                <div class="max-w-4xl mx-auto w-full flex flex-col gap-10 paper-sheet">
            <div class="flex flex-col gap-6 w-full">
                <div class="flex gap-4 items-center">
                    <button onclick="toggleSidebar()" class="bg-transparent border border-ink-black text-ink-black w-8 h-8 flex-shrink-0 rounded-lg hover:bg-parchment-deep transition-colors flex items-center justify-center cursor-pointer mr-2" title="Toggle Sidebar">
                        <span id="toggle-icon" class="material-symbols-outlined text-xl">${toggleIconText}</span>
                    </button>
                    <span class="inline-block px-3 py-1 bg-parchment-deep hairline-b border-ink-black text-label-caps font-label-caps uppercase rounded-full">${item.type}</span>
                    <span class="text-technical-sm font-technical-sm text-on-surface-variant">Published: ${item.publishedDate}</span>
                </div>
                <h1 class="text-headline-lg-mobile md:text-5xl lg:text-headline-display font-headline-display leading-tight tracking-tighter">${item.title}</h1>
                <div class="flex flex-col gap-2 mt-4 hairline-t border-ink-black pt-4">
                    <h4 class="text-label-caps font-label-caps uppercase text-on-surface-variant">Authors</h4>
                    <p class="text-body-md font-body-md text-ink-black">${item.fullAuthors}</p>
                </div>
            </div>
            <div class="w-full flex flex-col gap-6">
                <div class="flex items-center gap-4 hairline-b border-ink-black pb-2 mb-4">
                    <span class="material-symbols-outlined text-ochre-discovery">article</span>
                    <h3 class="text-headline-md font-headline-md">Abstract</h3>
                </div>
                ${item.abstract.map(p => `<p class="text-body-lg font-body-lg text-ink-black leading-relaxed">${p}</p>`).join('')}
            </div>
            <div class="flex flex-wrap gap-4">${links}</div>
            <div id="markdown-content" class="prose prose-stone max-w-none w-full font-body-lg text-ink-black"></div>
        </div>
        `;
    }
    if (item.contentFile) {
        fetch(`${item.contentFile}?v=5`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(text => {
                const markdownContent = document.getElementById('markdown-content');
                if (typeof marked !== "undefined") {
                    marked.setOptions({ gfm: true, breaks: false });
                    markdownContent.innerHTML = marked.parse(text);
                } else {
                    markdownContent.innerHTML = text;
                }

                mountDiagrams(markdownContent);

                if (!essay && typeof mermaid !== 'undefined') {
                    const mermaidBlocks = document.querySelectorAll('code.language-mermaid');
                    mermaidBlocks.forEach(block => {
                        const pre = block.parentElement;
                        const div = document.createElement('div');
                        div.className = 'mermaid';
                        div.textContent = block.textContent;
                        pre.parentElement.replaceChild(div, pre);
                    });
                    const newMermaidBlocks = document.querySelectorAll('.mermaid');
                    if (newMermaidBlocks.length > 0) {
                        mermaid.run({nodes: newMermaidBlocks});
                    }
                }
                if (!essay) {
                    const headings = markdownContent.querySelectorAll('h2, h3');
                    headings.forEach(h => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'flex items-center gap-4 hairline-b border-ink-black pb-2 mb-6 mt-12 not-prose';
                        const newH = document.createElement(h.tagName);
                        newH.className = 'text-headline-md font-headline-md m-0 text-ink-black';
                        newH.innerHTML = h.innerHTML;
                        wrapper.appendChild(newH);
                        h.parentNode.replaceChild(wrapper, h);
                    });
                }
                const renderMath = () => {
                    if (window.renderMathInElement) {
                        renderMathInElement(markdownContent, {
                          delimiters: [
                              {left: '$$', right: '$$', display: true},
                              {left: '$', right: '$', display: false},
                              {left: '\\(', right: '\\)', display: false},
                              {left: '\\[', right: '\\]', display: true}
                          ],
                          throwOnError: false
                        });
                    } else {
                        setTimeout(renderMath, 100);
                    }
                };
                renderMath();
            })
            .catch(error => {
                console.error('Error fetching markdown:', error);
                document.getElementById('markdown-content').innerHTML = '';
            });
    }
    detailEl.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

