function renderNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return;
    
    // Determine active path to conditionally style links (optional enhancement)
    const currentPath = window.location.pathname;
    const isResearch = currentPath.includes('research.html');
    const isJoin = currentPath.includes('join.html');
    
    navbarPlaceholder.innerHTML = `
        <nav class="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-grid-margin h-16 bg-parchment-base/90 backdrop-blur-md border-b-[0.5px] border-outline">
            <a href="index.html" class="flex items-center gap-2 md:gap-4 cursor-pointer group decoration-transparent hover:decoration-transparent shrink-0">
                <span class="material-symbols-outlined text-crimson-authority text-lg md:text-2xl">grain</span>
                <span class="font-headline-md text-[1.2rem] md:text-headline-md tracking-tight text-ink-black group-hover:text-crimson-authority transition-colors">REFORCEMIND</span>
            </a>
            <div class="flex items-center gap-2 md:gap-8 font-label-caps text-label-caps ml-auto md:ml-0">
                <a class="${isResearch ? 'text-crimson-authority font-bold border-b border-crimson-authority' : 'text-on-surface-variant hover:text-crimson-authority'} transition-colors duration-300 px-1 md:px-2 py-1 text-[9px] md:text-[11px]" href="research.html">RESEARCH</a>
                <a class="${isJoin ? 'text-crimson-authority font-bold border-b border-crimson-authority' : 'text-on-surface-variant hover:text-crimson-authority'} transition-colors duration-300 px-1 md:px-2 py-1 text-[9px] md:text-[11px]" href="join.html">JOIN US</a>
            </div>
            <button class="hidden sm:block ml-4 font-label-caps text-label-caps text-crimson-authority hover:bg-surface-container-low transition-colors duration-300 px-4 py-2 border border-outline rounded-lg shrink-0">
                ARCHIVE
            </button>
        </nav>
    `;
}

function renderFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;
    
    footerPlaceholder.innerHTML = `
        <footer class="w-full flex flex-col md:flex-row justify-between items-start gap-4 px-6 md:px-grid-margin py-8 mt-auto bg-primary text-parchment-base border-t-[0.5px] border-ink-black z-50 relative">
            <div class="flex flex-wrap gap-4 font-technical-sm text-technical-sm">
                <a href="#" class="text-parchment-deep/70 hover:text-parchment-base transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">open_in_new</span> X (Twitter)
                </a>
                <a href="https://github.com/reforcemind" target="_blank" class="text-parchment-deep/70 hover:text-parchment-base transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">open_in_new</span> GitHub
                </a>
                <a href="https://huggingface.co/ReForceMind" target="_blank" class="text-parchment-deep/70 hover:text-parchment-base transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">open_in_new</span> Hugging Face
                </a>
                <a href="#" class="text-parchment-deep/70 hover:text-parchment-base transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">open_in_new</span> LinkedIn
                </a>
            </div>
            <div class="flex flex-wrap gap-8 font-label-caps text-label-caps mt-4 md:mt-0">
                <a class="text-parchment-deep/70 hover:text-parchment-base hover:tracking-widest transition-all duration-500" href="directory.html">INDEX</a>
                <a class="text-parchment-deep/70 hover:text-parchment-base hover:tracking-widest transition-all duration-500" href="ethics.html">ETHICS</a>
                <a class="text-parchment-deep/70 hover:text-parchment-base hover:tracking-widest transition-all duration-500" href="resources.html">RESOURCES</a>
            </div>
            <div class="text-technical-sm font-technical-sm text-parchment-deep/50 uppercase tracking-widest mt-8 md:mt-0">
                © 2026 REV_0.8.2
            </div>
        </footer>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    renderFooter();
});
