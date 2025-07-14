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
      'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-chamber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Atlas Reimagined</h1>
              <p className="text-xs text-gray-500">Carlsbad Chamber</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={clsx('flex-shrink-0 w-5 h-5', collapsed ? 'mr-0' : 'mr-3')} />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* AI Assistant */}
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
          {!collapsed && 'AI Assistant'}
        </button>
        {!collapsed && showAI && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 mb-2">Ask me anything about your members, events, or payments!</p>
            <div className="flex space-x-1">
              <input
                type="text"
                placeholder="Search members..."
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button className="p-1 bg-primary-500 text-white rounded hover:bg-primary-600">
                <Search className="w-3 h-3" />
              </button>
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
