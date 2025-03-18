/**
 * Eğitmen yönetimi için UI katmanı
 * Single Responsibility Principle: Sadece eğitmen arayüzünden sorumludur
 */
export default class TrainerUI {
    /**
     * @param {ITrainerService} trainerService - Eğitmen servisi
     */
    constructor(trainerService) {
        this.trainerService = trainerService;
        this.formElement = document.getElementById('add-trainer-form');
        this.tableElement = document.getElementById('trainers-table').querySelector('tbody');
        this.searchElement = document.getElementById('trainer-search');
        this.specializationSelect = document.getElementById('trainer-specialization-filter');
        
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
        
        // Uzmanlık filtresi değişimini dinle
        if (this.specializationSelect) {
            this.specializationSelect.addEventListener('change', () => this.handleSpecializationFilter());
        }
        
        // Sayfa yüklendiyse eğitmenleri yükle
        document.addEventListener('DOMContentLoaded', () => this.loadTrainers());
    }
    
    /**
     * Form submit işlemi
     * @param {Event} event - Form submit event'i
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        try {
            // Uzmanlık alanlarını al
            const specializationInputs = document.querySelectorAll('input[name="trainer-specialization"]:checked');
            const specializations = Array.from(specializationInputs).map(input => input.value);
            
            const trainerData = {
                name: document.getElementById('trainer-name').value,
                email: document.getElementById('trainer-email').value,
                phone: document.getElementById('trainer-phone').value,
                hourlyRate: document.getElementById('trainer-rate').value,
                bio: document.getElementById('trainer-bio').value,
                specializations
            };
            
            await this.trainerService.addTrainer(trainerData);
            
            // Formu sıfırla
            this.formElement.reset();
            
            // Eğitmenleri tekrar yükle
            this.loadTrainers();
            
            this.showNotification('Eğitmen başarıyla eklendi', 'success');
        } catch (error) {
            this.showNotification(`Hata: ${error.message}`, 'error');
        }
    }
    
    /**
     * Eğitmenleri yükler ve tabloya ekler
     */
    async loadTrainers() {
        try {
            const trainers = await this.trainerService.getAllTrainers();
            this.renderTrainersTable(trainers);
            this.updateSpecializationOptions(trainers);
        } catch (error) {
            this.showNotification(`Eğitmenler yüklenirken hata oluştu: ${error.message}`, 'error');
        }
    }
    
    /**
     * Mevcut tüm uzmanlık alanlarını filtreleme seçenekleri olarak günceller
     * @param {Array<Trainer>} trainers - Eğitmen listesi
     */
    updateSpecializationOptions(trainers) {
        if (!this.specializationSelect) return;
        
        // Mevcut tüm uzmanlık alanlarını topla
        const allSpecializations = new Set();
        trainers.forEach(trainer => {
            trainer.specializations.forEach(spec => {
                allSpecializations.add(spec);
            });
        });
        
        // Mevcut seçenekleri temizle
        this.specializationSelect.innerHTML = '<option value="">Tüm Uzmanlıklar</option>';
        
        // Uzmanlıkları ekle
        Array.from(allSpecializations).sort().forEach(spec => {
            const option = document.createElement('option');
            option.value = spec;
            option.textContent = spec;
            this.specializationSelect.appendChild(option);
        });
    }
    
    /**
     * Eğitmen tablosunu render eder
     * @param {Array<Trainer>} trainers - Gösterilecek eğitmen listesi
     */
    renderTrainersTable(trainers) {
        this.tableElement.innerHTML = '';
        
        if (trainers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center">Kayıtlı eğitmen bulunamadı</td>';
            this.tableElement.appendChild(row);
            return;
        }
        
        trainers.forEach(trainer => {
            const row = document.createElement('tr');
            
            // Aktiflik durumuna göre satır rengini ayarla
            if (!trainer.isActive) {
                row.classList.add('inactive');
            }
            
            row.innerHTML = `
                <td>${trainer.name}</td>
                <td>${trainer.email}</td>
                <td>${trainer.phone}</td>
                <td>${this.formatSpecializations(trainer.specializations)}</td>
                <td>${trainer.hourlyRate} ₺</td>
                <td>${trainer.isActive ? 'Aktif' : 'Pasif'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${trainer.id}">Düzenle</button>
                        <button class="delete-btn" data-id="${trainer.id}">Sil</button>
                        <button class="availability-btn" data-id="${trainer.id}">Müsaitlik</button>
                    </div>
                </td>
            `;
            
            // Butonlara event listener ekle
            row.querySelector('.edit-btn').addEventListener('click', () => this.handleEditTrainer(trainer.id));
            row.querySelector('.delete-btn').addEventListener('click', () => this.handleDeleteTrainer(trainer.id));
            row.querySelector('.availability-btn').addEventListener('click', () => this.handleAvailability(trainer.id));
            
            this.tableElement.appendChild(row);
        });
    }
    
    /**
     * Uzmanlık alanlarını formatlar
     * @param {Array<string>} specializations - Uzmanlık alanları
     * @returns {string} Formatlanmış uzmanlık alanları
     */
    formatSpecializations(specializations) {
        if (!specializations || specializations.length === 0) {
            return '-';
        }
        
        return specializations.join(', ');
    }
    
    /**
     * Uzmanlık alanı filtreleme işlemi
     */
    async handleSpecializationFilter() {
        const selectedSpecialization = this.specializationSelect.value;
        const searchTerm = this.searchElement.value.toLowerCase();
        
        try {
            let trainers;
            
            if (selectedSpecialization) {
                // Belirli bir uzmanlık alanına sahip eğitmenleri filtrele
                trainers = await this.trainerService.filterTrainers(trainer => {
                    return trainer.specializations.includes(selectedSpecialization);
                });
            } else {
                // Tüm eğitmenleri getir
                trainers = await this.trainerService.getAllTrainers();
            }
            
            // Eğer arama terimi varsa, arama filtresini de uygula
            if (searchTerm) {
                trainers = trainers.filter(trainer => {
                    return (
                        trainer.name.toLowerCase().includes(searchTerm) ||
                        trainer.email.toLowerCase().includes(searchTerm) ||
                        trainer.phone.includes(searchTerm)
                    );
                });
            }
            
            this.renderTrainersTable(trainers);
        } catch (error) {
            this.showNotification(`Eğitmenler filtrelenirken hata oluştu: ${error.message}`, 'error');
        }
    }
    
    /**
     * Eğitmen düzenleme işlemi
     * @param {string} id - Düzenlenecek eğitmenin ID'si
     */
    async handleEditTrainer(id) {
        try {
            const trainer = await this.trainerService.getTrainerById(id);
            
            // Modal oluştur
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h3>Eğitmen Düzenle</h3>
                    <form id="edit-trainer-form">
                        <div class="form-group">
                            <label for="edit-name">Ad Soyad:</label>
                            <input type="text" id="edit-name" value="${trainer.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-email">E-posta:</label>
                            <input type="email" id="edit-email" value="${trainer.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-phone">Telefon:</label>
                            <input type="tel" id="edit-phone" value="${trainer.phone}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-rate">Saatlik Ücret (₺):</label>
                            <input type="number" id="edit-rate" value="${trainer.hourlyRate}" required min="0">
                        </div>
                        <div class="form-group">
                            <label for="edit-bio">Biyografi:</label>
                            <textarea id="edit-bio" rows="3">${trainer.bio || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Uzmanlık Alanları:</label>
                            <div class="checkbox-group" id="edit-specializations">
                                ${this.renderSpecializationCheckboxes(trainer.specializations)}
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-status">Durum:</label>
                            <select id="edit-status">
                                <option value="true" ${trainer.isActive ? 'selected' : ''}>Aktif</option>
                                <option value="false" ${!trainer.isActive ? 'selected' : ''}>Pasif</option>
                            </select>
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
            modal.querySelector('#edit-trainer-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    // Uzmanlık alanlarını al
                    const specializationInputs = modal.querySelectorAll('input[name="edit-specialization"]:checked');
                    const specializations = Array.from(specializationInputs).map(input => input.value);
                    
                    const updatedData = {
                        name: modal.querySelector('#edit-name').value,
                        email: modal.querySelector('#edit-email').value,
                        phone: modal.querySelector('#edit-phone').value,
                        hourlyRate: modal.querySelector('#edit-rate').value,
                        bio: modal.querySelector('#edit-bio').value,
                        isActive: modal.querySelector('#edit-status').value === 'true'
                    };
                    
                    await this.trainerService.updateTrainer(id, updatedData);
                    await this.trainerService.updateSpecializations(id, specializations);
                    
                    closeModal();
                    this.loadTrainers();
                    this.showNotification('Eğitmen başarıyla güncellendi', 'success');
                } catch (error) {
                    this.showNotification(`Hata: ${error.message}`, 'error');
                }
            });
            
        } catch (error) {
            this.showNotification(`Hata: ${error.message}`, 'error');
        }
    }
    
    /**
     * Uzmanlık alanlarını checkbox olarak render eder
     * @param {Array<string>} selectedSpecializations - Seçili uzmanlık alanları
     * @returns {string} Checkbox HTML'i
     */
    renderSpecializationCheckboxes(selectedSpecializations = []) {
        const availableSpecializations = [
            'Fitness', 'Yoga', 'Pilates', 'Kickbox', 'Zumba', 'Spinning',
            'Beslenme', 'Kardiyovasküler', 'Güç Antrenmanı', 'Esneklik', 'Denge'
        ];
        
        return availableSpecializations.map(spec => {
            const isChecked = selectedSpecializations.includes(spec) ? 'checked' : '';
            return `
                <div class="checkbox-item">
                    <input type="checkbox" id="spec-${spec}" name="edit-specialization" value="${spec}" ${isChecked}>
                    <label for="spec-${spec}">${spec}</label>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Eğitmen müsaitlik düzenleme işlemi
     * @param {string} id - Eğitmenin ID'si
     */
    async handleAvailability(id) {
        try {
            const trainer = await this.trainerService.getTrainerById(id);
            
            // Modal oluştur
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content availability-modal">
                    <span class="close">&times;</span>
                    <h3>Müsaitlik Düzenle - ${trainer.name}</h3>
                    <form id="edit-availability-form">
                        ${this.renderAvailabilityForm(trainer.availability)}
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
            
            // Gün müsait değişim event'leri
            const dayAvailabilityToggles = modal.querySelectorAll('.day-available');
            dayAvailabilityToggles.forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const daySlots = document.getElementById(`slots-${e.target.dataset.day}`);
                    if (daySlots) {
                        daySlots.style.display = e.target.checked ? 'block' : 'none';
                    }
                });
            });
            
            // Form submit
            modal.querySelector('#edit-availability-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const availability = {};
                    
                    days.forEach(day => {
                        const isAvailable = modal.querySelector(`#${day}-available`).checked;
                        const slots = [];
                        
                        if (isAvailable) {
                            const slotRows = modal.querySelectorAll(`.slot-row[data-day="${day}"]`);
                            slotRows.forEach(row => {
                                const start = row.querySelector('.slot-start').value;
                                const end = row.querySelector('.slot-end').value;
                                
                                if (start && end) {
                                    slots.push({
                                        start,
                                        end,
                                        isBooked: false
                                    });
                                }
                            });
                        }
                        
                        availability[day] = {
                            isAvailable,
                            slots
                        };
                    });
                    
                    await this.trainerService.updateAvailability(id, availability);
                    
                    closeModal();
                    this.loadTrainers();
                    this.showNotification('Müsaitlik durumu başarıyla güncellendi', 'success');
                } catch (error) {
                    this.showNotification(`Hata: ${error.message}`, 'error');
                }
            });
            
        } catch (error) {
            this.showNotification(`Hata: ${error.message}`, 'error');
        }
    }
    
    /**
     * Müsaitlik düzenleme formunu render eder
     * @param {Object} availability - Mevcut müsaitlik bilgisi
     * @returns {string} Form HTML'i
     */
    renderAvailabilityForm(availability) {
        const days = [
            { key: 'monday', label: 'Pazartesi' },
            { key: 'tuesday', label: 'Salı' },
            { key: 'wednesday', label: 'Çarşamba' },
            { key: 'thursday', label: 'Perşembe' },
            { key: 'friday', label: 'Cuma' },
            { key: 'saturday', label: 'Cumartesi' },
            { key: 'sunday', label: 'Pazar' }
        ];
        
        return days.map(day => {
            const dayData = availability[day.key] || { isAvailable: false, slots: [] };
            const isAvailable = dayData.isAvailable;
            
            // Zaman dilimleri yoksa veya boşsa varsayılan iki dilim ekle
            let slots = dayData.slots;
            if (!slots || slots.length === 0) {
                slots = [
                    { start: '09:00', end: '12:00', isBooked: false },
                    { start: '13:00', end: '17:00', isBooked: false }
                ];
            }
            
            return `
                <div class="availability-day">
                    <div class="day-header">
                        <input type="checkbox" id="${day.key}-available" class="day-available" 
                            data-day="${day.key}" ${isAvailable ? 'checked' : ''}>
                        <label for="${day.key}-available">${day.label}</label>
                    </div>
                    
                    <div id="slots-${day.key}" class="time-slots" style="display: ${isAvailable ? 'block' : 'none'}">
                        ${slots.map((slot, index) => `
                            <div class="slot-row" data-day="${day.key}">
                                <input type="time" class="slot-start" value="${slot.start}" ${slot.isBooked ? 'disabled' : ''}>
                                <span>-</span>
                                <input type="time" class="slot-end" value="${slot.end}" ${slot.isBooked ? 'disabled' : ''}>
                                ${slot.isBooked ? '<span class="booked-badge">Rezerve</span>' : 
                                    `<button type="button" class="remove-slot" data-index="${index}">Kaldır</button>`}
                            </div>
                        `).join('')}
                        
                        <button type="button" class="add-slot" data-day="${day.key}">+ Zaman Dilimi Ekle</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Eğitmen silme işlemi
     * @param {string} id - Silinecek eğitmenin ID'si
     */
    async handleDeleteTrainer(id) {
        if (confirm('Bu eğitmeni silmek istediğinize emin misiniz?')) {
            try {
                await this.trainerService.deleteTrainer(id);
                this.loadTrainers();
                this.showNotification('Eğitmen başarıyla silindi', 'success');
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
        const selectedSpecialization = this.specializationSelect ? this.specializationSelect.value : '';
        
        try {
            let trainers = await this.trainerService.getAllTrainers();
            
            // Arama filtresi
            if (searchTerm) {
                trainers = trainers.filter(trainer => {
                    return (
                        trainer.name.toLowerCase().includes(searchTerm) ||
                        trainer.email.toLowerCase().includes(searchTerm) ||
                        trainer.phone.includes(searchTerm)
                    );
                });
            }
            
            // Uzmanlık filtresi
            if (selectedSpecialization) {
                trainers = trainers.filter(trainer => {
                    return trainer.specializations.includes(selectedSpecialization);
                });
            }
            
            this.renderTrainersTable(trainers);
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