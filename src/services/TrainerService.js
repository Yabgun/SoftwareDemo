import ITrainerService from '../interfaces/ITrainerService.js';
import Trainer from '../models/Trainer.js';

/**
 * Eğitmen servisi implementasyonu
 * Single Responsibility Principle: Sadece eğitmen işlemleri ile ilgilenir
 * Liskov Substitution Principle: ITrainerService'in tüm metodlarını implemente eder
 */
export default class TrainerService extends ITrainerService {
    constructor() {
        super();
        this.storageKey = 'gym_trainers';
    }
    
    /**
     * Local storage'dan eğitmenleri yükler
     * @private
     * @returns {Array<Trainer>} Eğitmen listesi
     */
    _loadTrainers() {
        const trainersData = localStorage.getItem(this.storageKey);
        if (!trainersData) {
            return [];
        }
        
        try {
            // JSON'dan tarihleri düzgün parse etmek için
            const trainers = JSON.parse(trainersData, (key, value) => {
                if (key === 'createdAt') {
                    return new Date(value);
                }
                return value;
            });
            
            // Nesneleri Trainer sınıfına dönüştür
            return trainers.map(t => {
                const trainer = new Trainer(
                    t.id, t.name, t.email, t.phone, 
                    t.specializations, t.hourlyRate, t.availability, t.bio
                );
                trainer.createdAt = t.createdAt;
                trainer.clients = t.clients || [];
                trainer.isActive = t.isActive !== undefined ? t.isActive : true;
                return trainer;
            });
        } catch (error) {
            console.error('Eğitmenler yüklenirken hata oluştu:', error);
            return [];
        }
    }
    
    /**
     * Eğitmenleri local storage'a kaydeder
     * @private
     * @param {Array<Trainer>} trainers - Kaydedilecek eğitmen listesi
     */
    _saveTrainers(trainers) {
        localStorage.setItem(this.storageKey, JSON.stringify(trainers));
    }
    
    /**
     * Yeni eğitmen ekler
     * @param {Object} trainerData - Eklenecek eğitmen bilgileri
     * @returns {Promise<Trainer>} Eklenen eğitmen
     */
    async addTrainer(trainerData) {
        const trainers = this._loadTrainers();
        
        // E-posta kontrolü
        const exists = trainers.some(t => t.email === trainerData.email);
        if (exists) {
            throw new Error('Bu e-posta adresi ile kayıtlı bir eğitmen zaten var');
        }
        
        // Yeni Trainer oluştur
        const newTrainer = new Trainer(
            null, 
            trainerData.name,
            trainerData.email,
            trainerData.phone,
            trainerData.specializations,
            trainerData.hourlyRate,
            trainerData.availability,
            trainerData.bio
        );
        
        trainers.push(newTrainer);
        this._saveTrainers(trainers);
        
        return newTrainer;
    }
    
    /**
     * Eğitmen bilgilerini günceller
     * @param {string} id - Güncellenecek eğitmenin ID'si
     * @param {Object} trainerData - Güncellenecek bilgiler
     * @returns {Promise<Trainer>} Güncellenen eğitmen
     */
    async updateTrainer(id, trainerData) {
        const trainers = this._loadTrainers();
        const index = trainers.findIndex(t => t.id === id);
        
        if (index === -1) {
            throw new Error('Eğitmen bulunamadı');
        }
        
        // Mevcut eğitmen bilgilerini al
        const currentTrainer = trainers[index];
        
        // Güncelleme yapılabilecek alanlar
        if (trainerData.name) currentTrainer.name = trainerData.name;
        if (trainerData.email) currentTrainer.email = trainerData.email;
        if (trainerData.phone) currentTrainer.phone = trainerData.phone;
        if (trainerData.bio) currentTrainer.bio = trainerData.bio;
        if (trainerData.hourlyRate !== undefined) {
            currentTrainer.updateHourlyRate(Number(trainerData.hourlyRate));
        }
        if (trainerData.isActive !== undefined) {
            currentTrainer.setActiveStatus(trainerData.isActive);
        }
        
        // Değişiklikleri kaydet
        trainers[index] = currentTrainer;
        this._saveTrainers(trainers);
        
        return currentTrainer;
    }
    
    /**
     * Eğitmeni siler
     * @param {string} id - Silinecek eğitmenin ID'si
     * @returns {Promise<boolean>} İşlem başarılı ise true
     */
    async deleteTrainer(id) {
        const trainers = this._loadTrainers();
        const newTrainers = trainers.filter(t => t.id !== id);
        
        if (newTrainers.length === trainers.length) {
            throw new Error('Eğitmen bulunamadı');
        }
        
        this._saveTrainers(newTrainers);
        return true;
    }
    
    /**
     * Belirli bir eğitmeni ID'ye göre getirir
     * @param {string} id - Eğitmen ID'si
     * @returns {Promise<Trainer>} Eğitmen bilgileri
     */
    async getTrainerById(id) {
        const trainers = this._loadTrainers();
        const trainer = trainers.find(t => t.id === id);
        
        if (!trainer) {
            throw new Error('Eğitmen bulunamadı');
        }
        
        return trainer;
    }
    
    /**
     * Tüm eğitmenleri getirir
     * @returns {Promise<Array<Trainer>>} Eğitmen listesi
     */
    async getAllTrainers() {
        return this._loadTrainers();
    }
    
    /**
     * Eğitmenleri filtreler
     * @param {Function} predicate - Filtreleme fonksiyonu
     * @returns {Promise<Array<Trainer>>} Filtrelenmiş eğitmen listesi
     */
    async filterTrainers(predicate) {
        const trainers = this._loadTrainers();
        return trainers.filter(predicate);
    }
    
    /**
     * Eğitmenin müsaitlik durumunu günceller
     * @param {string} id - Eğitmen ID'si
     * @param {Object} availability - Müsaitlik bilgisi
     * @returns {Promise<Trainer>} Güncellenen eğitmen
     */
    async updateAvailability(id, availability) {
        const trainers = this._loadTrainers();
        const index = trainers.findIndex(t => t.id === id);
        
        if (index === -1) {
            throw new Error('Eğitmen bulunamadı');
        }
        
        const trainer = trainers[index];
        trainer.availability = availability;
        
        trainers[index] = trainer;
        this._saveTrainers(trainers);
        
        return trainer;
    }
    
    /**
     * Eğitmenin uzmanlık alanlarını günceller
     * @param {string} id - Eğitmen ID'si
     * @param {Array} specializations - Uzmanlık alanları
     * @returns {Promise<Trainer>} Güncellenen eğitmen
     */
    async updateSpecializations(id, specializations) {
        const trainers = this._loadTrainers();
        const index = trainers.findIndex(t => t.id === id);
        
        if (index === -1) {
            throw new Error('Eğitmen bulunamadı');
        }
        
        const trainer = trainers[index];
        trainer.specializations = specializations;
        
        trainers[index] = trainer;
        this._saveTrainers(trainers);
        
        return trainer;
    }
} 