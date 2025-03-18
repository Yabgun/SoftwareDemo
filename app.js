/**
 * Basitleştirilmiş Uygulama
 */
class App {
    constructor() {
        this.setupNavigation();
    }
    
    /**
     * Navigasyon olaylarını ayarlar
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        const pages = document.querySelectorAll('.page');
        
        console.log('Navigation links:', navLinks.length);
        console.log('Pages:', pages.length);
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const pageId = link.getAttribute('data-page');
                console.log('Clicked on:', pageId);
                
                // Aktif sayfa ve link sınıflarını kaldır
                navLinks.forEach(link => link.classList.remove('active'));
                pages.forEach(page => page.classList.remove('active'));
                
                // Tıklanan linki aktif yap
                link.classList.add('active');
                
                // İlgili sayfayı göster
                const targetPage = document.getElementById(pageId);
                console.log('Target page:', targetPage);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
            });
        });
    }
}

// Uygulama başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app');
    window.app = new App();
}); 