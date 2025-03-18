/**
 * Üyelik servisi için interface tanımı
 * Interface Segregation ve Dependency Inversion prensiplerini sağlar
 */
export default class IMembershipService {
    /**
     * Yeni üye ekler
     * @param {Object} member - Eklenecek üye bilgileri
     * @returns {Promise<Object>} Eklenen üye
     */
    async addMember(member) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Üye bilgilerini günceller
     * @param {string} id - Güncellenecek üyenin ID'si
     * @param {Object} member - Güncellenecek bilgiler
     * @returns {Promise<Object>} Güncellenen üye
     */
    async updateMember(id, member) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Üyeyi siler
     * @param {string} id - Silinecek üyenin ID'si
     * @returns {Promise<boolean>} İşlem başarılı ise true
     */
    async deleteMember(id) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Belirli bir üyeyi ID'ye göre getirir
     * @param {string} id - Üye ID'si
     * @returns {Promise<Object>} Üye bilgileri
     */
    async getMemberById(id) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Tüm üyeleri getirir
     * @returns {Promise<Array<Object>>} Üye listesi
     */
    async getAllMembers() {
        throw new Error("Method not implemented");
    }
    
    /**
     * Üyeleri filtreler
     * @param {Function} predicate - Filtreleme fonksiyonu
     * @returns {Promise<Array<Object>>} Filtrelenmiş üye listesi
     */
    async filterMembers(predicate) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Üyelik süresini uzatır
     * @param {string} id - Üye ID'si
     * @param {Date} newEndDate - Yeni bitiş tarihi
     * @returns {Promise<Object>} Güncellenen üye
     */
    async extendMembership(id, newEndDate) {
        throw new Error("Method not implemented");
    }
} 