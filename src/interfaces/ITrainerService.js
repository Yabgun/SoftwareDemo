/**
 * Eğitmen servisi için interface tanımı
 * Interface Segregation ve Dependency Inversion prensiplerini sağlar
 */
export default class ITrainerService {
    /**
     * Yeni eğitmen ekler
     * @param {Object} trainer - Eklenecek eğitmen bilgileri
     * @returns {Promise<Object>} Eklenen eğitmen
     */
    async addTrainer(trainer) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Eğitmen bilgilerini günceller
     * @param {string} id - Güncellenecek eğitmenin ID'si
     * @param {Object} trainer - Güncellenecek bilgiler
     * @returns {Promise<Object>} Güncellenen eğitmen
     */
    async updateTrainer(id, trainer) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Eğitmeni siler
     * @param {string} id - Silinecek eğitmenin ID'si
     * @returns {Promise<boolean>} İşlem başarılı ise true
     */
    async deleteTrainer(id) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Belirli bir eğitmeni ID'ye göre getirir
     * @param {string} id - Eğitmen ID'si
     * @returns {Promise<Object>} Eğitmen bilgileri
     */
    async getTrainerById(id) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Tüm eğitmenleri getirir
     * @returns {Promise<Array<Object>>} Eğitmen listesi
     */
    async getAllTrainers() {
        throw new Error("Method not implemented");
    }
    
    /**
     * Eğitmenleri filtreler
     * @param {Function} predicate - Filtreleme fonksiyonu
     * @returns {Promise<Array<Object>>} Filtrelenmiş eğitmen listesi
     */
    async filterTrainers(predicate) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Eğitmenin müsaitlik durumunu günceller
     * @param {string} id - Eğitmen ID'si
     * @param {Array} availability - Müsaitlik bilgisi
     * @returns {Promise<Object>} Güncellenen eğitmen
     */
    async updateAvailability(id, availability) {
        throw new Error("Method not implemented");
    }
    
    /**
     * Eğitmenin uzmanlık alanlarını günceller
     * @param {string} id - Eğitmen ID'si
     * @param {Array} specializations - Uzmanlık alanları
     * @returns {Promise<Object>} Güncellenen eğitmen
     */
    async updateSpecializations(id, specializations) {
        throw new Error("Method not implemented");
    }
} 