import { rolesData } from './data.js';

let expandedRoleId = null;
let isInitialized = false;

function loadRoles() {
    if (typeof rolesData === 'undefined') {
        document.getElementById('roles-list').innerHTML = '<p class="text-crimson-authority">Error: data.js not loaded.</p>';
        return;
    }
    
    const listEl = document.getElementById('roles-list');
    
    const headerHtml = `
        <div class="border-b-[0.5px] border-ink-black pb-4 mb-8 flex justify-between items-end">
            <h2 class="text-label-caps font-label-caps uppercase tracking-widest text-ink-black">Open Roles</h2>
        </div>
    `;

    const blocksHtml = rolesData.map((role) => `
        <div id="role-block-${role.id}" class="absolute border-[0.5px] border-ink-black p-6 group cursor-pointer bg-parchment-deep text-ink-black hover:bg-[#F0C080] overflow-hidden z-20" onclick="handleRoleClick('${role.id}')">
            <span id="role-id-${role.id}" class="absolute top-4 right-4 text-technical-sm font-technical-sm text-on-surface-variant transition-colors duration-[1200ms]">${role.id}</span>
            <h3 class="text-headline-md font-headline-md mb-2 w-[85%] transition-colors duration-[1200ms]">${role.title}</h3>
            
            <div class="mt-8 flex justify-between items-end">
                <span id="role-team-${role.id}" class="inline-block px-3 py-1 bg-surface-bright text-label-caps font-label-caps rounded-full border-[0.5px] border-ink-black opacity-80 transition-colors duration-[1200ms]">${role.team}</span>
                <span id="role-icon-${role.id}" class="material-symbols-outlined transform group-hover:translate-x-1 transition-transform duration-700" style="font-variation-settings: 'FILL' 0;">arrow_forward</span>
            </div>
        </div>
    `).join('');

    const detailHtml = `
        <div id="role-detail-panel" class="absolute top-0 right-0 h-full w-full md:w-2/3 transition-all duration-[1200ms] ease-in-out opacity-0 translate-x-12 pointer-events-none z-10 hidden md:block">
            <div class="h-full bg-surface-bright border-[0.5px] border-ink-black p-8 md:p-12 md:ml-4 flex flex-col shadow-xl">
                <div class="flex items-center gap-4 mb-8 pb-4 border-b-[0.5px] border-ink-black/20">
                    <span class="material-symbols-outlined text-ochre-discovery text-3xl">terminal</span>
                    <h2 id="detail-title" class="text-headline-lg font-headline-lg">Title</h2>
                </div>
                <div class="overflow-y-auto flex-grow pr-4">
                    <p id="detail-desc" class="text-body-lg font-body-lg whitespace-pre-wrap leading-relaxed opacity-90 pb-8"></p>
                </div>
            </div>
        </div>
    `;

    listEl.innerHTML = `
        ${headerHtml}
        <div id="roles-wrapper" class="relative w-full overflow-visible transition-all duration-[1200ms] ease-in-out">
            ${blocksHtml}
            ${detailHtml}
        </div>
    `;
    
    isInitialized = true;
    
    window.addEventListener('resize', () => {
        updateRolesLayout();
    });

    setTimeout(updateRolesLayout, 50);
}

window.handleRoleClick = function(id) {
    if (window.innerWidth < 768) {
        if(id) openModal(id);
    } else {
        if (expandedRoleId === id) {
            expandedRoleId = null;
        } else {
            expandedRoleId = id;
        }
        updateRolesLayout();
    }
}

function updateRolesLayout() {
    if (!isInitialized) return;

    const wrapper = document.getElementById('roles-wrapper');
    const detailPanel = document.getElementById('role-detail-panel');
    
    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const gap = 16;
    const isMobile = window.innerWidth < 768;

    let maxContainerHeight = 0;

    if (expandedRoleId && !isMobile) {
        const colWidth = (wrapperWidth / 3) - (gap * 2 / 3);
        let yPos = 0;

        rolesData.forEach((role, i) => {
            const block = document.getElementById(`role-block-${role.id}`);
            
            const oldTransition = block.style.transition;
            const oldWidth = block.style.width;
            
            block.style.transition = 'none';
            block.style.width = `${colWidth}px`;
            const h = block.offsetHeight;
            
            block.style.width = oldWidth || '';
            void block.offsetHeight; 
            
            block.style.width = `${colWidth}px`;
            
            if (i === 1) {
                block.style.transition = 'top 600ms ease-in-out 0ms, left 600ms ease-in-out 600ms, width 600ms ease-in-out 600ms, transform 1200ms ease, opacity 1200ms ease, background-color 1200ms ease';
            } else if (i === 2) {
                block.style.transition = 'width 600ms ease-in-out 0ms, top 600ms ease-in-out 0ms, left 600ms ease-in-out 0ms, transform 1200ms ease, opacity 1200ms ease, background-color 1200ms ease';
            } else {
                block.style.transition = 'width 600ms ease-in-out 0ms, top 600ms ease-in-out 0ms, left 600ms ease-in-out 0ms, transform 1200ms ease, opacity 1200ms ease, background-color 1200ms ease';
            }
            
            block.style.left = `0px`;
            block.style.top = `${yPos}px`;
            
            const isActive = role.id === expandedRoleId;
            yPos += h + gap + (isActive ? 8 : 0);

            block.className = `absolute border-[0.5px] border-ink-black p-6 group cursor-pointer overflow-hidden z-20 ${isActive ? 'bg-ink-black text-parchment-base shadow-lg scale-[1.02]' : 'bg-parchment-deep text-ink-black hover:bg-[#F0C080] opacity-50 hover:opacity-100 scale-100'}`;
            document.getElementById(`role-id-${role.id}`).className = `absolute top-4 right-4 text-technical-sm font-technical-sm transition-colors duration-[1200ms] ${isActive ? 'text-parchment-deep/60' : 'text-on-surface-variant'}`;
            document.getElementById(`role-team-${role.id}`).className = `inline-block px-3 py-1 text-label-caps font-label-caps rounded-full border-[0.5px] transition-colors duration-[1200ms] opacity-80 ${isActive ? 'bg-parchment-deep text-ink-black border-transparent' : 'bg-surface-bright border-ink-black'}`;
            document.getElementById(`role-icon-${role.id}`).className = `material-symbols-outlined transform transition-transform duration-700 ${isActive ? 'translate-x-2 text-parchment-deep' : 'group-hover:translate-x-1'}`;
        });
        
        maxContainerHeight = yPos;

        detailPanel.style.transition = 'opacity 600ms ease-in-out 1200ms, transform 600ms ease-in-out 1200ms';
        detailPanel.className = 'absolute top-0 right-0 h-full w-full md:w-2/3 opacity-100 translate-x-0 z-10 hidden md:block';
        
        const role = rolesData.find(r => r.id === expandedRoleId);
        if (role) {
            document.getElementById('detail-title').innerText = role.title;
            document.getElementById('detail-desc').innerHTML = role.description;
        }

    } else {
        let xPos = 0;
        let yPos = 0;
        let rowMaxHeight = 0;
        
        const colWidth = isMobile ? wrapperWidth : (wrapperWidth / 2) - (gap / 2);

        rolesData.forEach((role, i) => {
            const block = document.getElementById(`role-block-${role.id}`);
            
            const isFullWidthRow = !isMobile && i === rolesData.length - 1 && rolesData.length % 2 !== 0;
            const targetW = isFullWidthRow ? wrapperWidth : colWidth;
            
            const oldTransition = block.style.transition;
            const oldWidth = block.style.width;
            
            block.style.transition = 'none';
            block.style.width = `${targetW}px`;
            const h = block.offsetHeight;
            
            block.style.width = oldWidth || '';
            void block.offsetHeight; 
            
            block.style.width = `${targetW}px`;

            if (i === 1) {
                block.style.transition = 'left 600ms ease-in-out 0ms, top 600ms ease-in-out 600ms, width 600ms ease-in-out 0ms, transform 1200ms ease, opacity 1200ms ease, background-color 1200ms ease';
            } else if (i === 2) {
                block.style.transition = 'top 600ms ease-in-out 600ms, width 600ms ease-in-out 600ms, left 600ms ease-in-out 0ms, transform 1200ms ease, opacity 1200ms ease, background-color 1200ms ease';
            } else {
                block.style.transition = 'width 600ms ease-in-out 0ms, top 600ms ease-in-out 0ms, left 600ms ease-in-out 0ms, transform 1200ms ease, opacity 1200ms ease, background-color 1200ms ease';
            }

            block.style.left = `${xPos}px`;
            block.style.top = `${yPos}px`;
            
            rowMaxHeight = Math.max(rowMaxHeight, h);
            
            if (isFullWidthRow || isMobile) {
                yPos += h + gap;
                xPos = 0;
                rowMaxHeight = 0;
            } else {
                if (xPos === 0) {
                    xPos = colWidth + gap;
                } else {
                    xPos = 0;
                    yPos += rowMaxHeight + gap;
                    rowMaxHeight = 0;
                }
            }

            block.className = `absolute border-[0.5px] border-ink-black p-6 group cursor-pointer overflow-hidden z-20 bg-parchment-deep text-ink-black hover:bg-[#F0C080] scale-100 opacity-100`;
            document.getElementById(`role-id-${role.id}`).className = `absolute top-4 right-4 text-technical-sm font-technical-sm text-on-surface-variant transition-colors duration-[1200ms]`;
            document.getElementById(`role-team-${role.id}`).className = `inline-block px-3 py-1 bg-surface-bright text-label-caps font-label-caps rounded-full border-[0.5px] border-ink-black opacity-80 transition-colors duration-[1200ms]`;
            document.getElementById(`role-icon-${role.id}`).className = `material-symbols-outlined transform group-hover:translate-x-1 transition-transform duration-700`;
        });

        maxContainerHeight = yPos + rowMaxHeight;

        if (detailPanel) {
            detailPanel.style.transition = 'opacity 600ms ease-in-out 0ms, transform 600ms ease-in-out 0ms';
            detailPanel.className = 'absolute top-0 right-0 h-full w-full md:w-2/3 opacity-0 translate-x-12 pointer-events-none z-10 hidden md:block';
        }
    }
    
    wrapper.style.height = `${maxContainerHeight}px`;
}

window.openModal = function(id) {
    const role = rolesData.find(r => r.id === id);
    if(!role) return;
    
    document.getElementById('modal-title').innerText = role.title;
    document.getElementById('modal-team').innerText = role.team;
    document.getElementById('modal-desc').innerHTML = role.description;
    
    const modal = document.getElementById('role-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

window.closeModal = function() {
    const modal = document.getElementById('role-modal');
    const content = document.getElementById('modal-content');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }, 200);
}

document.addEventListener("DOMContentLoaded", () => {
    loadRoles();
});

