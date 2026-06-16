let selectedId = null;

function toggleSidebar() {
    const sidebar = document.getElementById('research-sidebar');
    const toggleIcon = document.getElementById('toggle-icon');
    if (sidebar.style.display === 'none') {
        sidebar.style.display = '';
        if(toggleIcon) toggleIcon.innerText = 'keyboard_double_arrow_left';
    } else {
        sidebar.style.display = 'none';
        if(toggleIcon) toggleIcon.innerText = 'keyboard_double_arrow_right';
    }
}

function loadData() {
    if(typeof researchData !== 'undefined' && researchData.length > 0) {
        const countEl = document.getElementById('entries-count');
        if (countEl) countEl.innerText = `${researchData.length < 10 ? '0' : ''}${researchData.length} ENTRIES`;
        renderList();
        selectItem(researchData[0].id);
    } else {
        document.getElementById('research-list').innerHTML = '<p class="p-6 text-sm text-crimson-authority">Error: data.js not loaded.</p>';
    }
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

function selectItem(id) {
    selectedId = id;
    renderList();
    
    const item = researchData.find(d => d.id === id);
    if(!item) return;

    const detailEl = document.getElementById('research-detail');
    const isSidebarHidden = document.getElementById('research-sidebar') && document.getElementById('research-sidebar').style.display === 'none';
    const toggleIconText = isSidebarHidden ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left';

    detailEl.innerHTML = `
        <div class="max-w-4xl mx-auto w-full flex flex-col gap-10">
            <div class="flex flex-col gap-6 w-full">
                <div class="flex gap-4 items-center">
                    <button onclick="toggleSidebar()" class="bg-transparent border border-ink-black text-ink-black w-8 h-8 flex-shrink-0 rounded-lg hover:bg-parchment-deep transition-colors flex items-center justify-center cursor-pointer mr-2" title="Toggle Sidebar">
                        <span id="toggle-icon" class="material-symbols-outlined text-xl">${toggleIconText}</span>
                    </button>
                    <span class="inline-block px-3 py-1 bg-parchment-deep hairline-b border-ink-black text-label-caps font-label-caps uppercase rounded-full">${item.type}</span>
                    <span class="text-technical-sm font-technical-sm text-on-surface-variant">Published: ${item.publishedDate}</span>
                </div>
                <h1 class="text-headline-lg-mobile md:text-headline-display font-headline-display text-ink-black leading-tight tracking-tighter">${item.title}</h1>
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
            
            <div class="flex flex-wrap gap-4">
                ${item.links && item.links.pdf ? `
                <a href="${item.links.pdf}" target="_blank" class="bg-ink-black text-parchment-base px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-forest-intellect transition-colors">
                    <span class="material-symbols-outlined text-sm">download</span>
                    <span class="text-technical-sm font-technical-sm uppercase tracking-wider">Read PDF</span>
                </a>` : ''}
                ${item.links && item.links.github ? `
                <a href="${item.links.github}" target="_blank" class="bg-transparent border border-ink-black text-ink-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-parchment-deep transition-colors">
                    <span class="material-symbols-outlined text-sm">code</span>
                    <span class="text-technical-sm font-technical-sm uppercase tracking-wider">View GitHub</span>
                </a>` : ''}
                ${item.links && item.links.github2 ? `
                <a href="${item.links.github2}" target="_blank" class="bg-transparent border border-ink-black text-ink-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-parchment-deep transition-colors">
                    <span class="material-symbols-outlined text-sm">code</span>
                    <span class="text-technical-sm font-technical-sm uppercase tracking-wider">GitHub (CT-GMARL)</span>
                </a>` : ''}
                ${item.links && item.links.weights ? `
                <a href="${item.links.weights}" class="bg-transparent border border-ink-black text-ink-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-parchment-deep transition-colors">
                    <span class="material-symbols-outlined text-sm">database</span>
                    <span class="text-technical-sm font-technical-sm uppercase tracking-wider">Model Weights</span>
                </a>` : ''}
                ${item.links && item.links.huggingface ? `
                <a href="${item.links.huggingface}" target="_blank" class="bg-transparent border border-ink-black text-ink-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-parchment-deep transition-colors">
                    <span class="material-symbols-outlined text-sm">dataset</span>
                    <span class="text-technical-sm font-technical-sm uppercase tracking-wider">Datasets</span>
                </a>` : ''}
            </div>
            
            ${item.image ? `
            <div class="w-full h-64 bg-surface-variant relative overflow-hidden flex items-center justify-center border border-ink-black">
                <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('${item.image}');"></div>
                <div class="z-10 text-center">
                    <span class="material-symbols-outlined text-4xl text-ink-black mb-2">schema</span>
                    <p class="text-technical-sm font-technical-sm uppercase tracking-widest">${item.caption || ''}</p>
                </div>
            </div>
            ` : ''}
            
            <div id="markdown-content" class="prose prose-stone max-w-none w-full font-body-lg text-ink-black"></div>
        </div>
    `;

    // Fetch and render markdown content if available
    if (item.contentFile) {
        fetch(item.contentFile)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(text => {
                document.getElementById('markdown-content').innerHTML = marked.parse(text);
            })
            .catch(error => {
                console.error('Error fetching markdown:', error);
                document.getElementById('markdown-content').innerHTML = '';
            });
    }

    // Scroll to top when switching articles
    detailEl.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", () => {
    loadData();
});
