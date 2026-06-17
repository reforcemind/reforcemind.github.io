async function loadComponents() {
    try {
        const navRes = await fetch('components/navbar.html');
        if (navRes.ok) {
            document.getElementById('navbar-placeholder').innerHTML = await navRes.text();
            const currentUrl = window.location.href;
            if (currentUrl.includes('research.html')) {
                const el = document.getElementById('nav-research');
                if (el) {
                    el.classList.add('text-crimson-authority', 'font-bold', 'border-b', 'border-crimson-authority');
                    el.classList.remove('text-on-surface-variant');
                }
            } else if (currentUrl.includes('join.html')) {
                const el = document.getElementById('nav-join');
                if (el) {
                    el.classList.add('text-crimson-authority', 'font-bold', 'border-b', 'border-crimson-authority');
                    el.classList.remove('text-on-surface-variant');
                }
            }
        }
        
        const footRes = await fetch('components/footer.html');
        if (footRes.ok) {
            document.getElementById('footer-placeholder').innerHTML = await footRes.text();
        }
    } catch (e) {
        console.error('Error loading components:', e);
    }
}
document.addEventListener('DOMContentLoaded', loadComponents);


