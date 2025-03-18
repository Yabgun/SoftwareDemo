/**
 * Üye modeli
 * Single Responsibility Principle: Sadece üye verilerini temsil eder
 */
export default class Member {
    /**
     * @param {string} id - Üye ID
     * @param {string} name - Ad Soyad
     * @param {string} email - E-posta
     * @param {string} phone - Telefon
     * @param {string} membershipType - Üyelik tipi (standard, premium, vip)
     * @param {Date} startDate - Başlangıç tarihi
     * @param {Date} endDate - Bitiş tarihi
     */
    constructor(id, name, email, phone, membershipType, startDate, endDate) {
        this.id = id || this._generateId();
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.membershipType = membershipType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = new Date();
    }
    
    /**
     * Basit bir unique ID oluşturur
     * @private
     * @returns {string} Unique ID
     */
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Üyeliğin aktif olup olmadığını kontrol eder
     * @returns {boolean} Aktif ise true
     */
    isActive() {
        const today = new Date();
        return today >= this.startDate && today <= this.endDate;
    }
    
    /**
     * Üyelik bitimine kalan gün sayısını hesaplar
     * @returns {number} Kalan gün sayısı
     */
    daysRemaining() {
        const today = new Date();
        const diffTime = this.endDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    /**
     * Üyelik süresini uzatır
     * @param {Date} newEndDate - Yeni bitiş tarihi
     */
    extendMembership(newEndDate) {
        if (newEndDate <= this.endDate) {
            throw new Error("Yeni bitiş tarihi mevcut tarihten sonra olmalıdır");
        }
        this.endDate = newEndDate;
    }
    
    /**
     * Üyelik tipini değiştirir
     * @param {string} newType - Yeni üyelik tipi
     */
    changeMembershipType(newType) {
        const validTypes = ['standard', 'premium', 'vip'];
        if (!validTypes.includes(newType)) {
            throw new Error("Geçersiz üyelik tipi");
        }
        this.membershipType = newType;
    }
} 