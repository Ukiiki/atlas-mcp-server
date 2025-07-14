'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

const mockEvents = [
  {
    id: 1,
    title: 'Business Networking Breakfast',
    date: '2025-01-15',
    time: '7:30 AM - 9:00 AM',
    location: 'Carlsbad Village Chamber Office',
    description: 'Monthly networking event for chamber members to connect and grow their businesses.',
    attendees: 45,
    capacity: 60,
    price: 25,
    status: 'Upcoming',
    category: 'Networking'
  },
  {
    id: 2,
    title: 'Chamber Mixer',
    date: '2025-01-18',
    time: '5:30 PM - 7:30 PM',
    location: 'The Crossings at Carlsbad',
    description: 'Casual evening mixer with appetizers and drinks. Perfect for after-work networking.',
    attendees: 32,
    capacity: 50,
    price: 15,
    status: 'Upcoming',
    category: 'Social'
  },
  {
    id: 3,
    title: 'Economic Development Forum',
    date: '2025-01-22',
    time: '12:00 PM - 2:00 PM',
    location: 'Carlsbad City Library',
    description: 'Quarterly forum discussing economic trends and development opportunities in Carlsbad.',
    attendees: 78,
    capacity: 100,
    price: 35,
    status: 'Upcoming',
    category: 'Education'
  },
  {
    id: 4,
    title: 'Holiday Gala 2024',
    date: '2024-12-15',
    time: '6:00 PM - 10:00 PM',
    location: 'Omni La Costa Resort',
    description: 'Annual holiday celebration with dinner, awards, and entertainment.',
    attendees: 120,
    capacity: 120,
    price: 85,
    status: 'Completed',
    category: 'Special Event'
  },
  {
    id: 5,
    title: 'Leadership Workshop',
    date: '2025-02-05',
    time: '9:00 AM - 4:00 PM',
    location: 'Carlsbad Innovation Center',
    description: 'Full-day workshop on leadership skills for business owners and managers.',
    attendees: 18,
    capacity: 25,
    price: 125,
    status: 'Upcoming',
    category: 'Education'
  }
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list')

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         event.category.toLowerCase() === selectedFilter ||
                         event.status.toLowerCase() === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Networking': return 'bg-purple-100 text-purple-800'
      case 'Education': return 'bg-orange-100 text-orange-800'
      case 'Social': return 'bg-green-100 text-green-800'
      case 'Special Event': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAttendancePercentage = (attendees: number, capacity: number) => {
    return Math.round((attendees / capacity) * 100)
  }

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Manage chamber events and registrations</p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events by title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="networking">Networking</option>
            <option value="education">Education</option>
            <option value="social">Social</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {event.attendees}/{event.capacity} registered
                      </span>
                      <div className="ml-2 flex-1 max-w-20">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              getAttendancePercentage(event.attendees, event.capacity) >= 90 
                                ? 'bg-red-500' 
                                : getAttendancePercentage(event.attendees, event.capacity) >= 75 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${getAttendancePercentage(event.attendees, event.capacity)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        ${event.price} per person
                      </span>
                    </div>

                    <div className="flex items-center">
                      {event.status === 'Upcoming' ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        Revenue: ${(event.attendees * event.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
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
              </div>
            </div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="card">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{mockEvents.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{mockEvents.filter(e => e.status === 'Upcoming').length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{mockEvents.reduce((sum, e) => sum + e.attendees, 0)}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Event Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${mockEvents.reduce((sum, e) => sum + (e.attendees * e.price), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
