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
            } else if (currentUrl.includes('flowedge.html')) {
                const el = document.getElementById('nav-flowedge');
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
        
        const flowersHTML = `
            <div class="fixed top-[20%] right-[5%] pointer-events-none z-0 mix-blend-multiply opacity-60 rotate-[-10deg]">
                <img src="assets/flower.jpg" alt="" class="w-32 md:w-48 object-contain">
            </div>
            <div class="fixed top-[60%] left-[3%] pointer-events-none z-0 mix-blend-multiply opacity-50 rotate-12">
                <img src="assets/flower2.jpg" alt="" class="w-24 md:w-40 object-contain">
            </div>
            <div class="fixed top-[10%] left-[25%] pointer-events-none z-0 mix-blend-multiply opacity-40 rotate-[35deg]">
                <img src="assets/flower3.jpg" alt="" class="w-20 md:w-32 object-contain">
            </div>
            <div class="fixed bottom-[15%] right-[25%] pointer-events-none z-0 mix-blend-multiply opacity-45 rotate-[-45deg]">
                <img src="assets/flower4.jpg" alt="" class="w-28 md:w-44 object-contain">
            </div>
            <div class="fixed top-[45%] right-[20%] pointer-events-none z-0 mix-blend-multiply opacity-50 rotate-45">
                <img src="assets/flower5.jpg" alt="" class="w-24 md:w-36 object-contain">
            </div>
            <div class="fixed bottom-[5%] left-[40%] pointer-events-none z-0 mix-blend-multiply opacity-30 rotate-[-15deg]">
                <img src="assets/flower6.jpg" alt="" class="w-20 md:w-32 object-contain">
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', flowersHTML);
    } catch (e) {
        console.error('Error', e);
    }
}
document.addEventListener('DOMContentLoaded', loadComponents);


