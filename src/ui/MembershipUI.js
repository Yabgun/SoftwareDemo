/**
 * Üyelik yönetimi için UI katmanı
 * Single Responsibility Principle: Sadece üyelik arayüzünden sorumludur
 */
export default class MembershipUI {
    /**
     * @param {IMembershipService} membershipService - Üyelik servisi
     */
    constructor(membershipService) {
        this.membershipService = membershipService;
        this.formElement = document.getElementById('add-member-form');
        this.tableElement = document.getElementById('members-table').querySelector('tbody');
        this.searchElement = document.getElementById('member-search');
        
        this.initEventListeners();
    }
    
    /**
     * Event listener'ları başlatır
     */
    initEventListeners() {
        // Form submit event'i
        this.formElement.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Arama event'i
        this.searchElement.addEventListener('input', (e) => this.handleSearch(e));
        
        // Sayfa yüklendiyse üyeleri yükle
        document.addEventListener('DOMContentLoaded', () => this.loadMembers());
    }
    
    /**
     * Form submit işlemi
     * @param {Event} event - Form submit event'i
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        try {
            const memberData = {
                name: document.getElementById('member-name').value,
                email: document.getElementById('member-email').value,
                phone: document.getElementById('member-phone').value,
                membershipType: document.getElementById('membership-type').value,
                startDate: document.getElementById('membership-start').value,
                endDate: document.getElementById('membership-end').value
            };
            
            await this.membershipService.addMember(memberData);
            
            // Formu sıfırla
            this.formElement.reset();
            
            // Üyeleri tekrar yükle
            this.loadMembers();
            
            this.showNotification('Üye başarıyla eklendi', 'success');
        } catch (error) {
            this.showNotification(`Hata: ${error.message}`, 'error');
        }
    }
    
    /**
     * Üyeleri yükler ve tabloya ekler
     */
    async loadMembers() {
        try {
            const members = await this.membershipService.getAllMembers();
            this.renderMembersTable(members);
        } catch (error) {
            this.showNotification(`Üyeler yüklenirken hata oluştu: ${error.message}`, 'error');
        }
    }
    
    /**
     * Üye tablosunu render eder
     * @param {Array<Member>} members - Gösterilecek üye listesi
     */
    renderMembersTable(members) {
        this.tableElement.innerHTML = '';
        
        if (members.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center">Kayıtlı üye bulunamadı</td>';
            this.tableElement.appendChild(row);
            return;
        }
        
        members.forEach(member => {
            const row = document.createElement('tr');
            
            // Üyelik durumuna göre satır rengini ayarla
            if (!member.isActive()) {
                row.classList.add('inactive');
            }
            
            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>${this.formatMembershipType(member.membershipType)}</td>
                <td>${this.formatDate(member.startDate)}</td>
                <td>${this.formatDate(member.endDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${member.id}">Düzenle</button>
                        <button class="delete-btn" data-id="${member.id}">Sil</button>
                    </div>
                </td>
            `;
            
            // Butonlara event listener ekle
            row.querySelector('.edit-btn').addEventListener('click', () => this.handleEditMember(member.id));
            row.querySelector('.delete-btn').addEventListener('click', () => this.handleDeleteMember(member.id));
            
            this.tableElement.appendChild(row);
        });
    }
    
    /**
     * Üyelik tipini formatlar
     * @param {string} type - Üyelik tipi
     * @returns {string} Formatlanmış üyelik tipi
     */
    formatMembershipType(type) {
        const types = {
            'standard': 'Standart',
            'premium': 'Premium',
            'vip': 'VIP'
        };
        return types[type] || type;
    }
    
    /**
     * Tarihi formatlar
     * @param {Date} date - Formatlanacak tarih
     * @returns {string} Formatlanmış tarih
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('tr-TR');
    }
    
    /**
     * Üye düzenleme işlemi
     * @param {string} id - Düzenlenecek üyenin ID'si
     */
    async handleEditMember(id) {
        try {
            const member = await this.membershipService.getMemberById(id);
            
            // Modal oluştur
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h3>Üye Düzenle</h3>
                    <form id="edit-member-form">
                        <div class="form-group">
                            <label for="edit-name">Ad Soyad:</label>
                            <input type="text" id="edit-name" value="${member.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-email">E-posta:</label>
                            <input type="email" id="edit-email" value="${member.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-phone">Telefon:</label>
                            <input type="tel" id="edit-phone" value="${member.phone}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-type">Üyelik Tipi:</label>
                            <select id="edit-type">
                                <option value="standard" ${member.membershipType === 'standard' ? 'selected' : ''}>Standart</option>
                                <option value="premium" ${member.membershipType === 'premium' ? 'selected' : ''}>Premium</option>
                                <option value="vip" ${member.membershipType === 'vip' ? 'selected' : ''}>VIP</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-start">Başlangıç Tarihi:</label>
                            <input type="date" id="edit-start" value="${this.formatDateForInput(member.startDate)}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-end">Bitiş Tarihi:</label>
                            <input type="date" id="edit-end" value="${this.formatDateForInput(member.endDate)}" required>
                        </div>
                        <button type="submit">Kaydet</button>
                    </form>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Modal kapatma
            const closeModal = () => {
                document.body.removeChild(modal);
            };
            
            modal.querySelector('.close').addEventListener('click', closeModal);
            
            // Modal dışına tıklama
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Form submit
            modal.querySelector('#edit-member-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const updatedData = {
                        name: modal.querySelector('#edit-name').value,
                        email: modal.querySelector('#edit-email').value,
                        phone: modal.querySelector('#edit-phone').value,
                        membershipType: modal.querySelector('#edit-type').value,
                        startDate: modal.querySelector('#edit-start').value,
                        endDate: modal.querySelector('#edit-end').value
                    };
                    
                    await this.membershipService.updateMember(id, updatedData);
                    closeModal();
                    this.loadMembers();
                    this.showNotification('Üye başarıyla güncellendi', 'success');
                } catch (error) {
                    this.showNotification(`Hata: ${error.message}`, 'error');
                }
            });
            
        } catch (error) {
            this.showNotification(`Hata: ${error.message}`, 'error');
        }
    }
    
    /**
     * Input için tarihi formatlar
     * @param {Date} date - Formatlanacak tarih
     * @returns {string} YYYY-MM-DD formatında tarih
     */
    formatDateForInput(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        
        return [year, month, day].join('-');
    }
    
    /**
     * Üye silme işlemi
     * @param {string} id - Silinecek üyenin ID'si
     */
    async handleDeleteMember(id) {
        if (confirm('Bu üyeyi silmek istediğinize emin misiniz?')) {
            try {
                await this.membershipService.deleteMember(id);
                this.loadMembers();
                this.showNotification('Üye başarıyla silindi', 'success');
            } catch (error) {
                this.showNotification(`Hata: ${error.message}`, 'error');
            }
        }
    }
    
    /**
     * Arama işlemi
     * @param {Event} event - Arama input event'i
     */
    async handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        
        if (!searchTerm) {
            // Arama boşsa tüm üyeleri göster
            this.loadMembers();
            return;
        }
        
        try {
            // Üyeleri filtrele
            const members = await this.membershipService.filterMembers(member => {
                return (
                    member.name.toLowerCase().includes(searchTerm) ||
                    member.email.toLowerCase().includes(searchTerm) ||
                    member.phone.includes(searchTerm)
                );
            });
            
            this.renderMembersTable(members);
        } catch (error) {
            this.showNotification(`Arama sırasında hata oluştu: ${error.message}`, 'error');
        }
    }
    
    /**
     * Bildirim gösterir
     * @param {string} message - Bildirim mesajı
     * @param {string} type - Bildirim tipi (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Önceki bildirimleri temizle
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            document.body.removeChild(notification);
        });
        
        // Yeni bildirim oluştur
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3 saniye sonra kapat
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
} 