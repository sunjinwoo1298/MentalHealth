import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { LightMode, DarkMode, BrightnessAuto } from '@mui/icons-material'

interface ThemeToggleProps {
  value: string
  onChange: (theme: string) => void
  disabled?: boolean
}

export default function ThemeToggle({ value, onChange, disabled = false }: ThemeToggleProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_e, newValue) => newValue && onChange(newValue)}
      disabled={disabled}
      className="bg-slate-700/50"
    >
      <ToggleButton value="light" className="flex-1">
        <div className="flex flex-col items-center gap-1">
          <LightMode className="text-amber-400" />
          <Typography variant="caption" className="text-gray-300">
            Light
          </Typography>
        </div>
      </ToggleButton>
      <ToggleButton value="dark" className="flex-1">
        <div className="flex flex-col items-center gap-1">
          <DarkMode className="text-blue-400" />
          <Typography variant="caption" className="text-gray-300">
            Dark
          </Typography>
        </div>
      </ToggleButton>
      <ToggleButton value="system" className="flex-1">
        <div className="flex flex-col items-center gap-1">
          <BrightnessAuto className="text-purple-400" />
          <Typography variant="caption" className="text-gray-300">
            Auto
          </Typography>
        </div>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}