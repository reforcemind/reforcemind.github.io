function loadRoles() {
    if (typeof rolesData !== 'undefined') {
        renderRoles();
    } else {
        document.getElementById('roles-list').innerHTML = '<p class="text-crimson-authority">Error: data.js not loaded.</p>';
    }
}

function renderRoles() {
    const listEl = document.getElementById('roles-list');
    listEl.innerHTML = `
        <div class="col-span-1 md:col-span-2 border-b-[0.5px] border-ink-black pb-4 flex justify-between items-end">
            <h2 class="text-label-caps font-label-caps uppercase tracking-widest text-ink-black mb-4">Open Roles</h2>
        </div>
    ` + rolesData.map((role, index) => `
        <div class="bg-parchment-deep border-[0.5px] border-ink-black p-6 relative group hover:bg-[#F0C080] transition-colors duration-300 cursor-pointer ${index === rolesData.length - 1 ? 'md:col-span-2' : ''}" onclick="openModal('${role.id}')">
            <span class="absolute top-4 right-4 text-technical-sm font-technical-sm text-on-surface-variant">${role.id}</span>
            <h3 class="text-headline-md font-headline-md mb-2">${role.title}</h3>
            <div class="mt-8 flex justify-between items-end">
                <span class="inline-block px-3 py-1 bg-surface-bright text-label-caps font-label-caps rounded-full border-[0.5px] border-ink-black opacity-80">${role.team}</span>
                <span class="material-symbols-outlined text-ink-black transform group-hover:translate-x-1 transition-transform" style="font-variation-settings: 'FILL' 0;">arrow_forward</span>
            </div>
        </div>
    `).join('');
}

function openModal(id) {
    const role = rolesData.find(r => r.id === id);
    if(!role) return;
    
    document.getElementById('modal-title').innerText = role.title;
    document.getElementById('modal-team').innerText = role.team;
    document.getElementById('modal-desc').innerText = role.description;
    
    const modal = document.getElementById('role-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Trigger animation
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

function closeModal() {
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
