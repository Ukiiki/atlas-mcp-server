// Atlas MCP Server Frontend Application
class AtlasApp {
    constructor() {
        this.apiUrl = '/api';
        this.currentTab = 'dashboard';
        this.data = {
            members: [],
            committees: [],
            events: [],
            businessListings: [],
            categories: [],
            intelligence: null
        };
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.setupEventListeners();
        this.showTab('dashboard');
    }

    // API Communication
    async apiCall(endpoint, options = {}) {
        try {
            this.showLoading();
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            this.showError(`Failed to load data: ${error.message}`);
            return null;
        } finally {
            this.hideLoading();
        }
    }

    // Data Loading
    async loadInitialData() {
        try {
            const [intelligence, members, committees, events, businessListings, categories] = await Promise.all([
                this.apiCall('/comprehensive-intelligence'),
                this.apiCall('/members'),
                this.apiCall('/committees'),
                this.apiCall('/events'),
                this.apiCall('/business-listings'),
                this.apiCall('/listing-categories')
            ]);

            this.data.intelligence = intelligence;
            this.data.members = members || [];
            this.data.committees = committees || [];
            this.data.events = events || [];
            this.data.businessListings = businessListings || [];
            this.data.categories = categories || [];

            this.updateDashboard();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load initial data');
        }
    }

    // Dashboard Updates
    updateDashboard() {
        if (!this.data.intelligence) return;

        const { summary, memberBusinessAnalysis, committeeEngagement, eventAnalysis, insights } = this.data.intelligence;

        // Update member statistics
        document.getElementById('totalMembers').textContent = summary.totalMembers || 0;
        document.getElementById('newMembers').textContent = this.data.members.filter(m => this.isNewMember(m)).length;
        document.getElementById('membersWithBusiness').textContent = summary.membersWithBusinesses || 0;

        // Update event statistics
        document.getElementById('totalEvents').textContent = summary.totalEvents || 0;
        document.getElementById('eventAttendees').textContent = summary.totalEventAttendance || 0;
        document.getElementById('eventRevenue').textContent = this.formatCurrency(summary.totalEventRevenue || 0);

        // Update committee statistics
        document.getElementById('totalCommittees').textContent = summary.totalCommittees || 0;
        document.getElementById('committeeMembers').textContent = committeeEngagement.totalCommitteeMembers || 0;
        document.getElementById('committeeEvents').textContent = committeeEngagement.committeeEvents || 0;

        // Update business categories
        this.updateBusinessCategories(memberBusinessAnalysis.topIndustries || []);
    }

    updateBusinessCategories(topIndustries) {
        const container = document.getElementById('businessCategories');
        if (!topIndustries.length) {
            container.innerHTML = '<p>No business categories data available</p>';
            return;
        }

        container.innerHTML = `
            <div class="category-list">
                ${topIndustries.map(([category, count]) => `
                    <div class="category-item">
                        <span class="category-name">${category}</span>
                        <span class="category-count">${count}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Tab Management
    showTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'members':
                this.loadMembersTab();
                break;
            case 'committees':
                this.loadCommitteesTab();
                break;
            case 'events':
                this.loadEventsTab();
                break;
            case 'business':
                this.loadBusinessTab();
                break;
        }
    }

    // Members Tab
    loadMembersTab() {
        const tableBody = document.getElementById('membersTableBody');
        if (!this.data.members.length) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">No members found</td></tr>';
            return;
        }

        tableBody.innerHTML = this.data.members.map(member => `
            <tr>
                <td>${member.FirstName} ${member.LastName}</td>
                <td>${member.Email}</td>
                <td>${member.Company || '-'}</td>
                <td><span class="status-badge ${this.getStatusClass(member.Status)}">${member.Status}</span></td>
                <td>${this.formatDate(member.JoinDate)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="app.editMember('${member.Id}')">Edit</button>
                    <button class="btn btn-danger" onclick="app.suspendMember('${member.Id}')">Suspend</button>
                </td>
            </tr>
        `).join('');
    }

    // Committees Tab
    loadCommitteesTab() {
        const container = document.getElementById('committeeList');
        if (!this.data.committees.length) {
            container.innerHTML = '<p>No committees found</p>';
            return;
        }

        container.innerHTML = this.data.committees.map(committee => {
            const memberCount = this.getCommitteeMemberCount(committee.Id);
            return `
                <div class="committee-card">
                    <h3>${committee.Name}</h3>
                    <p>${committee.Description || 'No description available'}</p>
                    <div class="committee-stats">
                        <div class="committee-stat">
                            <div class="value">${memberCount}</div>
                            <div class="label">Members</div>
                        </div>
                        <div class="committee-stat">
                            <div class="value">${committee.IsActive ? 'Active' : 'Inactive'}</div>
                            <div class="label">Status</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="app.viewCommitteeDetails('${committee.Id}')">View Details</button>
                </div>
            `;
        }).join('');
    }

    // Events Tab
    loadEventsTab() {
        const container = document.getElementById('eventsList');
        if (!this.data.events.length) {
            container.innerHTML = '<p>No events found</p>';
            return;
        }

        container.innerHTML = this.data.events.map(event => `
            <div class="event-card">
                <h3>${event.EventName}</h3>
                <div class="event-meta">
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(event.StartDate)}</span>
                    <span><i class="fas fa-clock"></i> ${this.formatTime(event.StartDate)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${event.Location || 'TBD'}</span>
                    <span><i class="fas fa-tag"></i> ${event.EventType || 'General'}</span>
                </div>
                <div class="event-description">
                    ${event.Descr || 'No description available'}
                </div>
                <div class="event-stats">
                    <div class="event-stat">
                        <div class="value">${event.AttendingAttendees || 0}</div>
                        <div class="label">Attending</div>
                    </div>
                    <div class="event-stat">
                        <div class="value">${event.PendingAttendees || 0}</div>
                        <div class="label">Pending</div>
                    </div>
                    <div class="event-stat">
                        <div class="value">${this.formatCurrency(event.TotalInvoiced || 0)}</div>
                        <div class="label">Revenue</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Business Tab
    loadBusinessTab() {
        const container = document.getElementById('businessList');
        if (!this.data.businessListings.length) {
            container.innerHTML = '<p>No business listings found</p>';
            return;
        }

        // Populate category filter
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            this.data.categories.map(cat => `<option value="${cat.Id}">${cat.Category}</option>`).join('');

        container.innerHTML = this.data.businessListings.map(business => {
            const category = this.getCategoryName(business.CategoryId);
            return `
                <div class="business-card">
                    <h3>${business.Name}</h3>
                    <div class="business-info">
                        <p><i class="fas fa-building"></i> ${business.Description || 'No description'}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${this.formatAddress(business)}</p>
                        <p><i class="fas fa-phone"></i> ${business.Phone || 'No phone'}</p>
                        <p><i class="fas fa-envelope"></i> ${business.Email || 'No email'}</p>
                        <p><i class="fas fa-globe"></i> ${business.Website ? `<a href="${business.Website}" target="_blank">${business.Website}</a>` : 'No website'}</p>
                    </div>
                    <div class="business-category">${category}</div>
                </div>
            `;
        }).join('');
    }

    // Member Management
    async showAddMemberForm() {
        document.getElementById('addMemberModal').style.display = 'block';
    }

    closeAddMemberForm() {
        document.getElementById('addMemberModal').style.display = 'none';
        document.getElementById('addMemberForm').reset();
    }

    async addMember(formData) {
        const memberData = {
            FirstName: formData.firstName,
            LastName: formData.lastName,
            Email: formData.email,
            Phone: formData.phone,
            Company: formData.company,
            Title: formData.title
        };

        const result = await this.apiCall('/members', {
            method: 'POST',
            body: JSON.stringify(memberData)
        });

        if (result) {
            this.showSuccess('Member added successfully');
            this.closeAddMemberForm();
            await this.loadInitialData();
            this.loadMembersTab();
        }
    }

    async editMember(memberId) {
        // Implementation for editing member
        console.log('Edit member:', memberId);
    }

    async suspendMember(memberId) {
        if (!confirm('Are you sure you want to suspend this member?')) return;

        const result = await this.apiCall(`/members/${memberId}/suspend`, {
            method: 'POST'
        });

        if (result) {
            this.showSuccess('Member suspended successfully');
            await this.loadInitialData();
            this.loadMembersTab();
        }
    }

    // Committee Management
    async viewCommitteeDetails(committeeId) {
        const details = await this.apiCall(`/committees/${committeeId}/details`);
        if (details) {
            // Show committee details in modal or navigate to details page
            console.log('Committee details:', details);
        }
    }

    // Event Management
    filterEvents(type) {
        // Implementation for filtering events
        console.log('Filter events by:', type);
    }

    // Search and Filter Functions
    filterMembers() {
        const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#membersTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    filterBusinesses() {
        const searchTerm = document.getElementById('businessSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const cards = document.querySelectorAll('.business-card');

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            const matchesCategory = !categoryFilter || card.dataset.categoryId === categoryFilter;
            card.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
        });
    }

    // Utility Functions
    isNewMember(member) {
        if (!member.JoinDate) return false;
        const joinDate = new Date(member.JoinDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return joinDate > weekAgo;
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'status-active';
            case 'inactive': return 'status-inactive';
            case 'pending': return 'status-pending';
            default: return 'status-active';
        }
    }

    getCommitteeMemberCount(committeeId) {
        // This would typically come from the committee members data
        return Math.floor(Math.random() * 20) + 5; // Placeholder
    }

    getCategoryName(categoryId) {
        const category = this.data.categories.find(c => c.Id === categoryId);
        return category ? category.Category : 'Uncategorized';
    }

    formatAddress(business) {
        const parts = [business.Address1, business.City, business.State, business.Zip].filter(p => p);
        return parts.join(', ') || 'No address';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    formatTime(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // UI Helpers
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper notification system
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // Simple success display - could be enhanced with a proper notification system
        alert(`Success: ${message}`);
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            await this.addMember(data);
        });

        // Close modal when clicking outside
        document.getElementById('addMemberModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeAddMemberForm();
            }
        });
    }

    // Data Refresh
    async refreshData() {
        await this.loadInitialData();
        
        // Refresh current tab
        switch (this.currentTab) {
            case 'members':
                this.loadMembersTab();
                break;
            case 'committees':
                this.loadCommitteesTab();
                break;
            case 'events':
                this.loadEventsTab();
                break;
            case 'business':
                this.loadBusinessTab();
                break;
        }
        
        this.showSuccess('Data refreshed successfully');
    }
}

// Global functions for HTML onclick handlers
function showTab(tabName) {
    app.showTab(tabName);
}

function showAddMemberForm() {
    app.showAddMemberForm();
}

function closeAddMemberForm() {
    app.closeAddMemberForm();
}

function refreshData() {
    app.refreshData();
}

function filterMembers() {
    app.filterMembers();
}

function filterBusinesses() {
    app.filterBusinesses();
}

function filterEvents(type) {
    app.filterEvents(type);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AtlasApp();
});