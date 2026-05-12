'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ShoppingBag, DollarSign, TrendingUp, Package, MessageSquare } from 'lucide-react'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Merchants',
      value: '456',
      change: '+8%',
      icon: ShoppingBag,
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: '$12,345',
      change: '+23%',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: 'Growth Rate',
      value: '15.3%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all platform users',
      icon: Users,
      href: '/admin/users'
    },
    {
      title: 'Product Listings',
      description: 'Review and manage product listings',
      icon: Package,
      href: '/admin/products'
    },
    {
      title: 'Order Management',
      description: 'Track and manage orders',
      icon: ShoppingBag,
      href: '/admin/orders'
    },
    {
      title: 'Support Tickets',
      description: 'Handle customer support requests',
      icon: MessageSquare,
      href: '/admin/support'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Reverse Marketplace Admin Panel
          </p>
        </div>
        <Button onClick={() => setIsLoading(!isLoading)}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Icon className="h-5 w-5 mr-2 text-blue-600" />
                <CardTitle className="text-sm font-medium">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest activities across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New product listed</p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Order completed</p>
                <p className="text-xs text-muted-foreground">10 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
