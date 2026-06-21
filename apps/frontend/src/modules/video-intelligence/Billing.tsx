import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { CreditCard, Receipt, Download, TrendUp, Crown, Clock, Check } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { Separator } from '@/shared/ui/separator'
import { Card } from '@/shared/ui/card'
import { toast } from 'sonner'

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  plan: string
}

interface PlanFeature {
  name: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: PlanFeature[]
  popular?: boolean
}

export default function Billing() {
  const [currentPlan] = usePlatformKV<string>('hootner-current-plan', 'pro')
  const [invoices, setInvoices] = usePlatformKV<Invoice[]>('hootner-invoices', [
    {
      id: 'INV-2024-001',
      date: new Date('2024-03-01').toISOString(),
      amount: 49.99,
      status: 'paid',
      plan: 'Pro Plan',
    },
    {
      id: 'INV-2024-002',
      date: new Date('2024-02-01').toISOString(),
      amount: 49.99,
      status: 'paid',
      plan: 'Pro Plan',
    },
    {
      id: 'INV-2024-003',
      date: new Date('2024-01-01').toISOString(),
      amount: 49.99,
      status: 'paid',
      plan: 'Pro Plan',
    },
  ])

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 19.99,
      interval: 'month',
      features: [
        { name: '10 videos per month', included: true },
        { name: 'Basic AI insights', included: true },
        { name: '720p video quality', included: true },
        { name: '5 GB storage', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'API access', included: false },
        { name: 'Priority support', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49.99,
      interval: 'month',
      popular: true,
      features: [
        { name: '100 videos per month', included: true },
        { name: 'Advanced AI insights', included: true },
        { name: '4K video quality', included: true },
        { name: '50 GB storage', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'API access', included: true },
        { name: 'Priority support', included: false },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199.99,
      interval: 'month',
      features: [
        { name: 'Unlimited videos', included: true },
        { name: 'Custom AI models', included: true },
        { name: '8K video quality', included: true },
        { name: 'Unlimited storage', included: true },
        { name: '24/7 phone support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Full API access', included: true },
        { name: 'Dedicated account manager', included: true },
      ],
    },
  ]

  const usage = {
    videosUsed: 42,
    videosLimit: 100,
    storageUsed: 28.5,
    storageLimit: 50,
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice ${invoiceId}`)
  }

  const handleChangePlan = (planId: string) => {
    toast.success(`Plan change requested to ${planId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-400/20 text-green-400 border-green-400/30'
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
      case 'failed':
        return 'bg-red-400/20 text-red-400 border-red-400/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your plan and billing information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
              <h3 className="text-2xl font-bold">Pro Plan</h3>
              <p className="text-sm text-muted-foreground mt-1">$49.99 per month</p>
            </div>
            <Crown weight="fill" className="w-8 h-8 text-accent" />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock weight="bold" className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Next billing date</span>
            </div>
            <span className="font-semibold">April 1, 2024</span>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
              <h3 className="text-xl font-bold">•••• •••• •••• 4242</h3>
              <p className="text-sm text-muted-foreground mt-1">Expires 12/25</p>
            </div>
            <CreditCard weight="fill" className="w-8 h-8 text-accent" />
          </div>
          <Separator className="my-4" />
          <Button variant="outline" className="w-full">
            Update Payment Method
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Usage This Month</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Videos</span>
              <span className="font-mono font-semibold">
                {usage.videosUsed} / {usage.videosLimit}
              </span>
            </div>
            <Progress value={(usage.videosUsed / usage.videosLimit) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usage.videosLimit - usage.videosUsed} videos remaining
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-mono font-semibold">
                {usage.storageUsed} GB / {usage.storageLimit} GB
              </span>
            </div>
            <Progress value={(usage.storageUsed / usage.storageLimit) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {(usage.storageLimit - usage.storageUsed).toFixed(1)} GB remaining
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 relative ${
                plan.popular
                  ? 'border-accent shadow-lg shadow-accent/20'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                  <TrendUp weight="bold" className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      <Check weight="bold" className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant={currentPlan === plan.id ? 'outline' : 'default'}
                className={`w-full ${
                  currentPlan === plan.id
                    ? ''
                    : 'bg-accent text-accent-foreground hover:bg-accent/90'
                }`}
                onClick={() => handleChangePlan(plan.id)}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Billing History</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold">Invoice</th>
                  <th className="text-left p-4 text-sm font-semibold">Date</th>
                  <th className="text-left p-4 text-sm font-semibold">Plan</th>
                  <th className="text-right p-4 text-sm font-semibold">Amount</th>
                  <th className="text-center p-4 text-sm font-semibold">Status</th>
                  <th className="text-right p-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(invoices || []).map((invoice) => (
                  <tr key={invoice.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-4 font-mono text-sm">{invoice.id}</td>
                    <td className="p-4 text-sm">
                      {new Date(invoice.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-sm">{invoice.plan}</td>
                    <td className="p-4 text-right font-semibold">${invoice.amount.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
