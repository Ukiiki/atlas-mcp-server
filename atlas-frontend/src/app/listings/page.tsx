'use client'

import { useState } from 'react'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  TrendingUp,
  Download,
} from 'lucide-react'

const mockListings = [
  {
    id: 1,
    businessName: 'Johnson Marketing Solutions',
    category: 'Marketing & Advertising',
    address: '123 Carlsbad Village Dr, Carlsbad, CA 92008',
    phone: '(760) 555-0123',
    email: 'info@johnsonmarketing.com',
    website: 'www.johnsonmarketing.com',
    description: 'Full-service digital marketing agency specializing in social media, SEO, and brand development.',
    membershipLevel: 'Gold',
    featured: true,
    rating: 4.8,
    reviews: 24,
    logo: 'JM',
    status: 'Active'
  },
  {
    id: 2,
    businessName: 'Pacific Tech Solutions',
    category: 'Technology',
    address: '456 State St, Carlsbad, CA 92008',
    phone: '(760) 555-0124',
    email: 'contact@pacifictech.com',
    website: 'www.pacifictech.com',
    description: 'IT consulting and managed services for small to medium businesses.',
    membershipLevel: 'Silver',
    featured: false,
    rating: 4.6,
    reviews: 18,
    logo: 'PT',
    status: 'Active'
  },
  {
    id: 3,
    businessName: 'Coastal Real Estate',
    category: 'Real Estate',
    address: '789 Oceanside Blvd, Carlsbad, CA 92008',
    phone: '(760) 555-0125',
    email: 'emily@coastalre.com',
    website: 'www.coastalrealestate.com',
    description: 'Premier real estate services for buying and selling homes in North County San Diego.',
    membershipLevel: 'Platinum',
    featured: true,
    rating: 4.9,
    reviews: 42,
    logo: 'CR',
    status: 'Active'
  },
  {
    id: 4,
    businessName: 'Park Financial Advisors',
    category: 'Financial Services',
    address: '321 Business Park Dr, Carlsbad, CA 92008',
    phone: '(760) 555-0126',
    email: 'david@parkfinancial.com',
    website: 'www.parkfinancial.com',
    description: 'Comprehensive financial planning and investment management services.',
    membershipLevel: 'Gold',
    featured: false,
    rating: 4.7,
    reviews: 31,
    logo: 'PF',
    status: 'Active'
  },
  {
    id: 5,
    businessName: 'Thompson Design Studio',
    category: 'Design & Creative',
    address: '654 Innovation Way, Carlsbad, CA 92008',
    phone: '(760) 555-0127',
    email: 'lisa@thompsondesign.com',
    website: 'www.thompsondesign.com',
    description: 'Creative design studio offering branding, web design, and print marketing materials.',
    membershipLevel: 'Silver',
    featured: false,
    rating: 4.5,
    reviews: 15,
    logo: 'TD',
    status: 'Pending Review'
  },
  {
    id: 6,
    businessName: 'Martinez Construction',
    category: 'Construction',
    address: '987 Industrial Blvd, Carlsbad, CA 92008',
    phone: '(760) 555-0128',
    email: 'info@martinezconstruction.com',
    website: 'www.martinezconstruction.com',
    description: 'General contractor specializing in commercial and residential construction projects.',
    membershipLevel: 'Gold',
    featured: true,
    rating: 4.8,
    reviews: 28,
    logo: 'MC',
    status: 'Active'
  }
]

const categories = [
  'All Categories',
  'Marketing & Advertising',
  'Technology',
  'Real Estate',
  'Financial Services',
  'Design & Creative',
  'Construction',
  'Healthcare',
  'Education',
  'Restaurant & Food',
  'Retail'
]

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All Categories' || listing.category === selectedCategory
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'featured' && listing.featured) ||
                         (selectedFilter === 'active' && listing.status === 'Active') ||
                         listing.membershipLevel.toLowerCase() === selectedFilter
    
    return matchesSearch && matchesCategory && matchesFilter
  })

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800'
      case 'Inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/business-listings/csv');
      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business-listings.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Directory</h1>
            <p className="text-gray-600">Manage member business listings and directory</p>
          </div>
          <div className="flex space-x-2">
            <button
              className="btn-secondary flex items-center"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </button>
            <button className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{mockListings.length}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900">{mockListings.filter(l => l.status === 'Active').length}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Featured Listings</p>
              <p className="text-2xl font-bold text-gray-900">{mockListings.filter(l => l.featured).length}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search business name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Listings</option>
            <option value="featured">Featured</option>
            <option value="active">Active</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {listing.logo}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{listing.businessName}</h3>
                      <p className="text-sm text-gray-500">{listing.category}</p>
                    </div>
                  </div>
                  {listing.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{listing.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {listing.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="w-4 h-4 mr-2" />
                    {listing.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="w-4 h-4 mr-2" />
                    {listing.website}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {renderStars(listing.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {listing.rating} ({listing.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMembershipColor(listing.membershipLevel)}`}>
                      {listing.membershipLevel}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-medium">
                            {listing.logo}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {listing.businessName}
                              {listing.featured && (
                                <Star className="w-4 h-4 text-yellow-400 fill-current ml-2" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{listing.membershipLevel} Member</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.phone}</div>
                        <div className="text-sm text-gray-500">{listing.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderStars(listing.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {listing.rating}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{listing.reviews} reviews</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
