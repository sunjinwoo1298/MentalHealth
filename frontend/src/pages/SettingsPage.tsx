import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../components/ui/button"
import { 
  ArrowLeft,
  Settings,
  Bell,
  Palette,
  Shield,
  User,
  Heart,
  Lock,
  Download,
  Trash2,
  RefreshCw,
  Save,
  Menu,
  X,
  Home,
  MessageSquare,
  BarChart3,
  UserCircle,
  ChevronRight
} from "lucide-react"

interface SettingsData {
  notifications: {
    dailyReminders: boolean
    weeklyReports: boolean
    emergencyAlerts: boolean
    chatReminders: boolean
    emailNotifications: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    language: 'en' | 'hi' | 'ta' | 'te'
    highContrast: boolean
    reduceAnimations: boolean
  }
  privacy: {
    analytics: boolean
    crashReports: boolean
    dataSharing: boolean
    locationServices: boolean
  }
  wellness: {
    dailyGoal: number
    reminderTime: string
    weeklyGoal: number
    streakNotifications: boolean
  }
  account: {
    twoFactor: boolean
    backupEmails: boolean
    sessionTimeout: number
  }
}

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
  { id: 'progress', label: 'Progress', icon: BarChart3, path: '/progress' },
  { id: 'profile', label: 'Profile', icon: UserCircle, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', active: true },
]

const SETTINGS_SECTIONS = [
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-purple-600' },
  { id: 'display', label: 'Display & Language', icon: Palette, color: 'text-pink-600' },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield, color: 'text-cyan-600' },
  { id: 'wellness', label: 'Wellness Goals', icon: Heart, color: 'text-green-600' },
  { id: 'account', label: 'Account & Data', icon: User, color: 'text-blue-600' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('notifications')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      dailyReminders: true,
      weeklyReports: true,
      emergencyAlerts: true,
      chatReminders: false,
      emailNotifications: false,
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      language: 'en',
      highContrast: false,
      reduceAnimations: false,
    },
    privacy: {
      analytics: false,
      crashReports: true,
      dataSharing: false,
      locationServices: false,
    },
    wellness: {
      dailyGoal: 3,
      reminderTime: '09:00',
      weeklyGoal: 21,
      streakNotifications: true,
    },
    account: {
      twoFactor: false,
      backupEmails: true,
      sessionTimeout: 30,
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [isAuthenticated, navigate])

  const handleSettingChange = (category: keyof SettingsData, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings))
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      notifications: {
        dailyReminders: true,
        weeklyReports: true,
        emergencyAlerts: true,
        chatReminders: false,
        emailNotifications: false,
      },
      display: {
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        highContrast: false,
        reduceAnimations: false,
      },
      privacy: {
        analytics: false,
        crashReports: true,
        dataSharing: false,
        locationServices: false,
      },
      wellness: {
        dailyGoal: 3,
        reminderTime: '09:00',
        weeklyGoal: 21,
        streakNotifications: true,
      },
      account: {
        twoFactor: false,
        backupEmails: true,
        sessionTimeout: 30,
      },
    })
    setMessage('Settings reset to defaults')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const renderNotificationsCard = () => (
    <div className="bg-white/90 backdrop-blur border-2 border-purple-200 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Notifications</h3>
          <p className="text-gray-600">Manage how you receive updates</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Daily Wellness Reminders</h4>
            <p className="text-sm text-gray-600">Get gentle reminders to check in with yourself</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.dailyReminders}
              onChange={(e) => handleSettingChange('notifications', 'dailyReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Weekly Progress Reports</h4>
            <p className="text-sm text-gray-600">Receive weekly summaries of your wellness journey</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReports}
              onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 opacity-50">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Emergency Alerts 🚨</h4>
            <p className="text-sm text-gray-600">Critical safety notifications (cannot be disabled)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.emergencyAlerts}
              disabled
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-red-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Chat Session Reminders</h4>
            <p className="text-sm text-gray-600">Reminders for scheduled therapy sessions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.chatReminders}
              onChange={(e) => handleSettingChange('notifications', 'chatReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Email Notifications</h4>
            <p className="text-sm text-gray-600">Important updates sent to your email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderDisplayCard = () => (
    <div className="bg-white/90 backdrop-blur border-2 border-pink-200 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Display & Language</h3>
          <p className="text-gray-600">Customize how the app looks and feels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Theme Preference</label>
          <select
            value={settings.display.theme}
            onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
            className="w-full p-4 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none font-medium"
          >
            <option value="light">☀️ Light Theme</option>
            <option value="dark">🌙 Dark Theme</option>
            <option value="auto">🔄 Auto (System)</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Font Size</label>
          <select
            value={settings.display.fontSize}
            onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
            className="w-full p-4 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none font-medium"
          >
            <option value="small">🔍 Small</option>
            <option value="medium">📝 Medium</option>
            <option value="large">🔍 Large</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Language</label>
          <select
            value={settings.display.language}
            onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
            className="w-full p-4 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none font-medium"
          >
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 हिंदी (Hindi)</option>
            <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
            <option value="te">🇮🇳 తెలుగు (Telugu)</option>
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border border-pink-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">High Contrast Mode</h4>
            <p className="text-sm text-gray-600">Enhanced visibility for better readability</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.display.highContrast}
              onChange={(e) => handleSettingChange('display', 'highContrast', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border border-pink-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Reduce Animations</h4>
            <p className="text-sm text-gray-600">Minimize motion for sensitive users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.display.reduceAnimations}
              onChange={(e) => handleSettingChange('display', 'reduceAnimations', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderPrivacyCard = () => (
    <div className="bg-white/90 backdrop-blur border-2 border-cyan-200 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Privacy & Security</h3>
          <p className="text-gray-600">Control your data and privacy settings</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Anonymous Analytics</h4>
            <p className="text-sm text-gray-600">Help improve the app with anonymous usage data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.analytics}
              onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Crash Reports</h4>
            <p className="text-sm text-gray-600">Help us fix bugs and improve stability</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.crashReports}
              onChange={(e) => handleSettingChange('privacy', 'crashReports', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Research Data Sharing</h4>
            <p className="text-sm text-gray-600">Contribute to mental health research (anonymized)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.dataSharing}
              onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-cyan-200">
        <Button 
          onClick={() => navigate('/privacy')}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-2xl"
        >
          <Lock className="w-4 h-4 mr-2" />
          Advanced Privacy Settings
        </Button>
      </div>
    </div>
  )

  const renderWellnessCard = () => (
    <div className="bg-white/90 backdrop-blur border-2 border-green-200 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Wellness Goals</h3>
          <p className="text-gray-600">Set and track your wellness objectives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Daily Check-in Goal</label>
          <select
            value={settings.wellness.dailyGoal}
            onChange={(e) => handleSettingChange('wellness', 'dailyGoal', parseInt(e.target.value))}
            className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none font-medium"
          >
            <option value={1}>1 check-in per day</option>
            <option value={2}>2 check-ins per day</option>
            <option value={3}>3 check-ins per day</option>
            <option value={4}>4 check-ins per day</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Reminder Time</label>
          <input
            type="time"
            value={settings.wellness.reminderTime}
            onChange={(e) => handleSettingChange('wellness', 'reminderTime', e.target.value)}
            className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none font-medium"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Streak Notifications</h4>
            <p className="text-sm text-gray-600">Get notified when you hit wellness streaks</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.wellness.streakNotifications}
              onChange={(e) => handleSettingChange('wellness', 'streakNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderAccountCard = () => (
    <div className="bg-white/90 backdrop-blur border-2 border-blue-200 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Account & Data</h3>
          <p className="text-gray-600">Manage your account settings and data</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.account.twoFactor}
              onChange={(e) => handleSettingChange('account', 'twoFactor', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Backup Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive important account updates via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.account.backupEmails}
              onChange={(e) => handleSettingChange('account', 'backupEmails', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button 
          variant="outline"
          className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-2xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
        <Button 
          variant="outline"
          className="border-2 border-red-300 text-red-600 hover:bg-red-50 font-bold py-3 rounded-2xl"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'notifications':
        return renderNotificationsCard()
      case 'display':
        return renderDisplayCard()
      case 'privacy':
        return renderPrivacyCard()
      case 'wellness':
        return renderWellnessCard()
      case 'account':
        return renderAccountCard()
      default:
        return renderNotificationsCard()
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-vibrant-mesh">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur border-r-2 border-coral-200 shadow-vibrant transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col h-full`}>
        <div className="flex items-center justify-between h-16 px-6 border-b-2 border-coral-200 flex-shrink-0">
          <h1 className="text-xl font-bold bg-coral-gradient bg-clip-text text-transparent">
            BloomMind
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4">
          <div className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => item.path !== '/settings' ? navigate(item.path) : null}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-2xl font-medium transition-all ${
                    item.active
                      ? 'bg-coral-gradient text-white shadow-coral'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-coral-50 hover:to-sunflower-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.label}
                  {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </div>

          <div className="mt-8 pt-8 border-t-2 border-purple-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-left rounded-2xl font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur border-b-2 border-turquoise-200 shadow-turquoise sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600">Customize your wellness experience</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-sunflower-gradient hover:bg-gradient-to-r hover:from-sunflower-600 hover:to-tangerine-600 text-white font-bold px-6 py-2 rounded-2xl shadow-sunflower animate-vibrate-glow"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleResetSettings}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold px-6 py-2 rounded-2xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {/* Success Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-2xl border-2 font-medium ${
              message.includes('Failed')
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="lg:w-80">
              <div className="bg-white/90 backdrop-blur border-2 border-violet-200 rounded-3xl p-6 shadow-violet">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Settings Categories</h2>
                <nav className="space-y-2">
                  {SETTINGS_SECTIONS.map((section) => {
                    const IconComponent = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-2xl font-medium transition-all ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-coral-100 to-sunflower-100 border-2 border-coral-300 text-coral-700 shadow-coral'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-lavender-50 hover:to-turquoise-50'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 mr-3 ${section.color}`} />
                        {section.label}
                        {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Active Settings Card */}
            <div className="flex-1">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}