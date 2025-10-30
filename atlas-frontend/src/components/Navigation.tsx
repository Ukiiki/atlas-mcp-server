'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Building2,
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Listings', href: '/listings', icon: Building2 },
]

export default function Navigation() {
  const [collapsed, setCollapsed] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const pathname = usePathname()

  return (
    <div className={clsx(
      'flex flex-col glass backdrop-blur-2xl border-r border-white/30 transition-all duration-500 shadow-2xl',
      collapsed ? 'w-20' : 'w-72'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        {!collapsed && (
          <div className="flex items-center space-x-3 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-ocean-700 bg-clip-text text-transparent">Carlsbad Chamber</h1>
              <p className="text-xs text-gray-600 font-medium">Management Hub</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-ocean-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <span className="text-white font-bold text-lg">C</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl hover:bg-primary-50/50 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-primary-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-primary-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{ animationDelay: `${index * 50}ms` }}
              className={clsx(
                'flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 animate-slide-up group',
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-ocean-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105 active:scale-95',
                collapsed && 'justify-center'
              )}
            >
              <item.icon className={clsx(
                'flex-shrink-0 w-5 h-5 transition-transform duration-300',
                collapsed ? 'mr-0' : 'mr-3',
                isActive ? 'scale-110' : 'group-hover:scale-110'
              )} />
              {!collapsed && <span className="tracking-wide">{item.name}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Navigation AI */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setShowAI(!showAI)}
          className={clsx(
            'flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
            showAI
              ? 'bg-chamber-50 text-chamber-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Bot className={clsx('flex-shrink-0 w-5 h-5', collapsed ? 'mr-0' : 'mr-3')} />
          {!collapsed && 'Quick Nav AI'}
        </button>
        {!collapsed && showAI && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 mb-2">Quick search & navigation</p>
            <div className="space-y-2">
              <div className="flex space-x-1">
                <input
                  type="text"
                  placeholder="Find member..."
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button className="p-1 bg-primary-500 text-white rounded hover:bg-primary-600">
                  <Search className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Recent Members
                </button>
                <button className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                  Upcoming Events
                </button>
                <button className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                  Pending Payments
                </button>
                <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                  Active Listings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">U</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">User</p>
                <p className="text-xs text-gray-500">Chamber Staff</p>
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
