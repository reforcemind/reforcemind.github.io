async function loadComponents() {
    try {
        const navRes = await fetch('components/navbar.html');
        if (navRes.ok) {
            document.getElementById('navbar-placeholder').innerHTML = await navRes.text();
            const currentUrl = window.location.href;
            const highlight = (id) => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.add('text-crimson-authority', 'font-bold', 'border-b', 'border-crimson-authority');
                    el.classList.remove('text-on-surface-variant');
                }
            };
            if (currentUrl.includes('research.html')) highlight('nav-research');
            else if (currentUrl.includes('join.html')) highlight('nav-join');
            else if (currentUrl.includes('products.html') || currentUrl.includes('flowedge.html') || currentUrl.includes('netforge.html')) highlight('nav-products');

            const toggle = document.getElementById('nav-toggle');
            const drawer = document.getElementById('nav-drawer');
            const icon = document.getElementById('nav-toggle-icon');
            if (toggle && drawer) {
                toggle.addEventListener('click', () => {
                    const open = drawer.classList.toggle('hidden') === false;
                    toggle.setAttribute('aria-expanded', String(open));
                    if (icon) icon.textContent = open ? 'close' : 'menu';
                    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
                });
            }
        }

        const footRes = await fetch('components/footer.html');
        if (footRes.ok) {
            const foot = document.getElementById('footer-placeholder');
            if (foot) foot.innerHTML = await footRes.text();
        }

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const flowersHTML = `
            <div class="dither-vignette"></div>
            <div class="flora flora-a" style="${reduce ? 'animation:none' : ''}"><img src="assets/flower.jpg" alt=""></div>
            <div class="flora flora-b" style="${reduce ? 'animation:none' : ''}"><img src="assets/flower2.jpg" alt=""></div>
            <div class="flora flora-c" style="${reduce ? 'animation:none' : ''}"><img src="assets/flower3.jpg" alt=""></div>
            <div class="flora flora-d" style="${reduce ? 'animation:none' : ''}"><img src="assets/flower4.jpg" alt=""></div>
            <div class="flora flora-e" style="${reduce ? 'animation:none' : ''}"><img src="assets/flower5.jpg" alt=""></div>
            <div class="flora flora-f" style="${reduce ? 'animation:none' : ''}"><img src="assets/flower6.jpg" alt=""></div>
        `;
        document.body.insertAdjacentHTML('afterbegin', flowersHTML);
    } catch (e) {
        console.error('Error', e);
    }
}
document.addEventListener('DOMContentLoaded', loadComponents);
