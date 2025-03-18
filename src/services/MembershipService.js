import IMembershipService from '../interfaces/IMembershipService.js';
import Member from '../models/Member.js';

/**
 * Üyelik servisi implementasyonu
 * Single Responsibility Principle: Sadece üyelik işlemleri ile ilgilenir
 * Liskov Substitution Principle: IMembershipService'in tüm metodlarını implemente eder
 */
export default class MembershipService extends IMembershipService {
    constructor() {
        super();
        this.storageKey = 'gym_members';
    }
    
    /**
     * Local storage'dan üyeleri yükler
     * @private
     * @returns {Array<Member>} Üye listesi
     */
    _loadMembers() {
        const membersData = localStorage.getItem(this.storageKey);
        if (!membersData) {
            return [];
        }
        
        try {
            // JSON'dan tarihleri düzgün parse etmek için
            const members = JSON.parse(membersData, (key, value) => {
                if (key === 'startDate' || key === 'endDate' || key === 'createdAt') {
                    return new Date(value);
                }
                return value;
            });
            
            // Nesneleri Member sınıfına dönüştür
            return members.map(m => {
                const member = new Member(
                    m.id, m.name, m.email, m.phone, 
                    m.membershipType, m.startDate, m.endDate
                );
                member.createdAt = m.createdAt;
                return member;
            });
        } catch (error) {
            console.error('Üyeler yüklenirken hata oluştu:', error);
            return [];
        }
    }
    
    /**
     * Üyeleri local storage'a kaydeder
     * @private
     * @param {Array<Member>} members - Kaydedilecek üye listesi
     */
    _saveMembers(members) {
        localStorage.setItem(this.storageKey, JSON.stringify(members));
    }
    
    /**
     * Yeni üye ekler
     * @param {Object} memberData - Eklenecek üye bilgileri
     * @returns {Promise<Member>} Eklenen üye
     */
    async addMember(memberData) {
        const members = this._loadMembers();
        
        // E-posta kontrolü
        const exists = members.some(m => m.email === memberData.email);
        if (exists) {
            throw new Error('Bu e-posta adresi ile kayıtlı bir üye zaten var');
        }
        
        // Tarih string'den Date'e çevirme
        const startDate = new Date(memberData.startDate);
        const endDate = new Date(memberData.endDate);
        
        // Yeni Member oluştur
        const newMember = new Member(
            null, 
            memberData.name,
            memberData.email,
            memberData.phone,
            memberData.membershipType,
            startDate,
            endDate
        );
        
        members.push(newMember);
        this._saveMembers(members);
        
        return newMember;
    }
    
    /**
     * Üye bilgilerini günceller
     * @param {string} id - Güncellenecek üyenin ID'si
     * @param {Object} memberData - Güncellenecek bilgiler
     * @returns {Promise<Member>} Güncellenen üye
     */
    async updateMember(id, memberData) {
        const members = this._loadMembers();
        const index = members.findIndex(m => m.id === id);
        
        if (index === -1) {
            throw new Error('Üye bulunamadı');
        }
        
        // Mevcut üye bilgilerini al
        const currentMember = members[index];
        
        // Güncelleme yapılabilecek alanlar
        if (memberData.name) currentMember.name = memberData.name;
        if (memberData.email) currentMember.email = memberData.email;
        if (memberData.phone) currentMember.phone = memberData.phone;
        if (memberData.membershipType) {
            currentMember.changeMembershipType(memberData.membershipType);
        }
        if (memberData.startDate) {
            currentMember.startDate = new Date(memberData.startDate);
        }
        if (memberData.endDate) {
            currentMember.endDate = new Date(memberData.endDate);
        }
        
        // Değişiklikleri kaydet
        members[index] = currentMember;
        this._saveMembers(members);
        
        return currentMember;
    }
    
    /**
     * Üyeyi siler
     * @param {string} id - Silinecek üyenin ID'si
     * @returns {Promise<boolean>} İşlem başarılı ise true
     */
    async deleteMember(id) {
        const members = this._loadMembers();
        const newMembers = members.filter(m => m.id !== id);
        
        if (newMembers.length === members.length) {
            throw new Error('Üye bulunamadı');
        }
        
        this._saveMembers(newMembers);
        return true;
    }
    
    /**
     * Belirli bir üyeyi ID'ye göre getirir
     * @param {string} id - Üye ID'si
     * @returns {Promise<Member>} Üye bilgileri
     */
    async getMemberById(id) {
        const members = this._loadMembers();
        const member = members.find(m => m.id === id);
        
        if (!member) {
            throw new Error('Üye bulunamadı');
        }
        
        return member;
    }
    
    /**
     * Tüm üyeleri getirir
     * @returns {Promise<Array<Member>>} Üye listesi
     */
    async getAllMembers() {
        return this._loadMembers();
    }
    
    /**
     * Üyeleri filtreler
     * @param {Function} predicate - Filtreleme fonksiyonu
     * @returns {Promise<Array<Member>>} Filtrelenmiş üye listesi
     */
    async filterMembers(predicate) {
        const members = this._loadMembers();
        return members.filter(predicate);
    }
    
    /**
     * Üyelik süresini uzatır
     * @param {string} id - Üye ID'si
     * @param {Date} newEndDate - Yeni bitiş tarihi
     * @returns {Promise<Member>} Güncellenen üye
     */
    async extendMembership(id, newEndDate) {
        const members = this._loadMembers();
        const index = members.findIndex(m => m.id === id);
        
        if (index === -1) {
            throw new Error('Üye bulunamadı');
        }
        
        const member = members[index];
        member.extendMembership(new Date(newEndDate));
        
        // Değişiklikleri kaydet
        members[index] = member;
        this._saveMembers(members);
        
        return member;
    }
} 