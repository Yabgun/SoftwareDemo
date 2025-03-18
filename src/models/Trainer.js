/**
 * Eğitmen modeli
 * Single Responsibility Principle: Sadece eğitmen verilerini temsil eder
 */
export default class Trainer {
    /**
     * @param {string} id - Eğitmen ID
     * @param {string} name - Ad Soyad
     * @param {string} email - E-posta
     * @param {string} phone - Telefon
     * @param {Array<string>} specializations - Uzmanlık alanları
     * @param {number} hourlyRate - Saatlik ücret
     * @param {Object} availability - Müsaitlik durumu
     * @param {string} bio - Kısa biyografi
     */
    constructor(id, name, email, phone, specializations, hourlyRate, availability, bio) {
        this.id = id || this._generateId();
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.specializations = specializations || [];
        this.hourlyRate = hourlyRate || 0;
        this.availability = availability || this._getDefaultAvailability();
        this.bio = bio || '';
        this.createdAt = new Date();
        this.clients = []; // Eğitmenin çalıştığı üyeler
        this.isActive = true; // Eğitmenin aktif olma durumu
    }
    
    /**
     * Basit bir unique ID oluşturur
     * @private
     * @returns {string} Unique ID
     */
    _generateId() {
        return 'tr_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Varsayılan müsaitlik durumu oluşturur
     * @private
     * @returns {Object} Varsayılan müsaitlik durumu
     */
    _getDefaultAvailability() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const availability = {};
        
        days.forEach(day => {
            availability[day] = {
                isAvailable: day !== 'sunday',
                slots: day !== 'sunday' ? [
                    { start: '09:00', end: '12:00', isBooked: false },
                    { start: '13:00', end: '17:00', isBooked: false }
                ] : []
            };
        });
        
        return availability;
    }
    
    /**
     * Eğitmene yeni bir uzmanlık alanı ekler
     * @param {string} specialization - Eklenecek uzmanlık alanı
     */
    addSpecialization(specialization) {
        if (!this.specializations.includes(specialization)) {
            this.specializations.push(specialization);
        }
    }
    
    /**
     * Eğitmenden bir uzmanlık alanını kaldırır
     * @param {string} specialization - Kaldırılacak uzmanlık alanı
     */
    removeSpecialization(specialization) {
        this.specializations = this.specializations.filter(spec => spec !== specialization);
    }
    
    /**
     * Saatlik ücreti günceller
     * @param {number} rate - Yeni saatlik ücret
     */
    updateHourlyRate(rate) {
        if (rate < 0) {
            throw new Error("Saatlik ücret 0'dan küçük olamaz");
        }
        this.hourlyRate = rate;
    }
    
    /**
     * Belirli bir gün için müsaitlik durumunu günceller
     * @param {string} day - Gün adı (monday, tuesday, ...)
     * @param {boolean} isAvailable - Müsait olma durumu
     * @param {Array} slots - Zaman dilimleri
     */
    updateDailyAvailability(day, isAvailable, slots = []) {
        if (!this.availability[day]) {
            throw new Error("Geçersiz gün adı");
        }
        
        this.availability[day] = {
            isAvailable,
            slots: isAvailable ? slots : []
        };
    }
    
    /**
     * Eğitmenin belirli bir zaman diliminde müsait olup olmadığını kontrol eder
     * @param {string} day - Gün adı
     * @param {string} startTime - Başlangıç saati (HH:MM)
     * @param {string} endTime - Bitiş saati (HH:MM)
     * @returns {boolean} Müsait ise true
     */
    isAvailableAt(day, startTime, endTime) {
        const dayAvailability = this.availability[day];
        
        if (!dayAvailability || !dayAvailability.isAvailable) {
            return false;
        }
        
        // Zaman dilimlerini kontrol et
        for (const slot of dayAvailability.slots) {
            // İstenen zaman dilimi mevcut bir zaman diliminin içinde mi?
            if (slot.start <= startTime && slot.end >= endTime && !slot.isBooked) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Eğitmene yeni bir üye ekler
     * @param {string} clientId - Üye ID'si
     */
    addClient(clientId) {
        if (!this.clients.includes(clientId)) {
            this.clients.push(clientId);
        }
    }
    
    /**
     * Eğitmenden bir üyeyi kaldırır
     * @param {string} clientId - Üye ID'si
     */
    removeClient(clientId) {
        this.clients = this.clients.filter(id => id !== clientId);
    }
    
    /**
     * Eğitmenin aktiflik durumunu değiştirir
     * @param {boolean} status - Yeni aktiflik durumu
     */
    setActiveStatus(status) {
        this.isActive = status;
    }
} 