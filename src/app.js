import MembershipService from './services/MembershipService.js';
import TrainerService from './services/TrainerService.js';
import MembershipUI from './ui/MembershipUI.js';
import TrainerUI from './ui/TrainerUI.js';

/**
 * Ana uygulama
 * Dependency Inversion Principle uygulaması: Service'ler interface'ler üzerinden enjekte edilir
 */
class App {
    constructor() {
        this.initServices();
        this.initUI();
        this.setupNavigation();
    }
    
    /**
     * Servisleri başlatır
     */
    initServices() {
        // Servisleri oluştur ve bağımlılıkları enjekte et
        this.membershipService = new MembershipService();
        this.trainerService = new TrainerService();
        
        // Diğer servisler ileriki aşamalarda eklenecek
    }
    
    /**
     * UI bileşenlerini başlatır
     */
    initUI() {
        // UI bileşenlerini oluştur ve servisleri enjekte et
        this.membershipUI = new MembershipUI(this.membershipService);
        this.trainerUI = new TrainerUI(this.trainerService);
        
        // Diğer UI bileşenleri ileriki aşamalarda eklenecek
    }
    
    /**
     * Navigasyon olaylarını ayarlar
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        const pages = document.querySelectorAll('.page');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Aktif sayfa ve link sınıflarını kaldır
                navLinks.forEach(link => link.classList.remove('active'));
                pages.forEach(page => page.classList.remove('active'));
                
                // Tıklanan linki aktif yap
                link.classList.add('active');
                
                // İlgili sayfayı göster
                const pageId = link.getAttribute('data-page');
                const targetPage = document.getElementById(pageId);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
            });
        });
    }
}

// Uygulama başlat
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 