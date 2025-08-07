'use client';

import { ThemeToggle, ThemeToggleCompact } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ThemeDemoPage() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="btn btn-ghost mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <h1 className="text-4xl font-bold mb-2">Theme System Demo</h1>
          <p className="text-base-content/70">
            Test the three-state theme toggle: Light, Dark, and System preference
          </p>
        </div>

        {/* Current Theme Info */}
        <div className="alert alert-info mb-8">
          <div>
            <h3 className="font-bold">Current Theme Status</h3>
            <p>Selected: <span className="font-mono">{theme}</span></p>
            <p>Resolved: <span className="font-mono">{resolvedTheme}</span></p>
            <p>System prefers: <span className="font-mono">
              {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
            </span></p>
          </div>
        </div>

        {/* Theme Toggle Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Dropdown Toggle (Main)</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Full-featured dropdown with icons and labels
              </p>
              <ThemeToggle />
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Compact Toggle</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Cycles through themes on click
              </p>
              <ThemeToggleCompact />
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Switch Style</h2>
              <p className="text-sm text-base-content/70 mb-4">
                DaisyUI toggle switch (Light/Dark only)
              </p>
              <ThemeToggleCompact />
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Radio Group</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Traditional radio buttons with icons
              </p>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* DaisyUI Component Showcase */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">DaisyUI Components in Current Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Buttons */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-primary">Primary</button>
                  <button className="btn btn-secondary">Secondary</button>
                  <button className="btn btn-accent">Accent</button>
                  <button className="btn btn-neutral">Neutral</button>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="badge badge-primary">Primary</div>
                  <div className="badge badge-secondary">Secondary</div>
                  <div className="badge badge-accent">Accent</div>
                  <div className="badge badge-info">Info</div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Alerts</h3>
                <div className="space-y-2">
                  <div className="alert alert-info">
                    <span>Info alert</span>
                  </div>
                  <div className="alert alert-success">
                    <span>Success alert</span>
                  </div>
                  <div className="alert alert-warning">
                    <span>Warning alert</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Controls */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Form Controls</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Text input" className="input input-bordered w-full" />
                  <select className="select select-bordered w-full">
                    <option>Select option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Remember me</span>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Progress</h3>
                <div className="space-y-3">
                  <progress className="progress progress-primary w-full" value="70" max="100"></progress>
                  <progress className="progress progress-secondary w-full" value="50" max="100"></progress>
                  <progress className="progress progress-accent w-full" value="30" max="100"></progress>
                </div>
              </div>
            </div>

            {/* Toggle Examples */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Toggles & Radios</h3>
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Toggle</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Radio</span>
                      <input type="radio" name="radio-demo" className="radio" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Theme Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Primary', class: 'bg-primary text-primary-content' },
              { name: 'Secondary', class: 'bg-secondary text-secondary-content' },
              { name: 'Accent', class: 'bg-accent text-accent-content' },
              { name: 'Neutral', class: 'bg-neutral text-neutral-content' },
              { name: 'Base-100', class: 'bg-base-100 text-base-content border border-base-300' },
              { name: 'Base-200', class: 'bg-base-200 text-base-content' },
              { name: 'Base-300', class: 'bg-base-300 text-base-content' },
              { name: 'Info', class: 'bg-info text-info-content' },
              { name: 'Success', class: 'bg-success text-success-content' },
              { name: 'Warning', class: 'bg-warning text-warning-content' },
              { name: 'Error', class: 'bg-error text-error-content' },
            ].map((color) => (
              <div key={color.name} className={`rounded-lg p-4 text-center ${color.class}`}>
                <div className="font-semibold">{color.name}</div>
                <div className="text-xs opacity-70 mt-1">{color.class.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">How to Test</h2>
            <div className="space-y-2">
              <p>1. <strong>Light Mode:</strong> Select &ldquo;Light&rdquo; - all colors should use light theme palette</p>
              <p>2. <strong>Dark Mode:</strong> Select &ldquo;Dark&rdquo; - all colors should use dark theme palette</p>
              <p>3. <strong>System Mode:</strong> Select &ldquo;System&rdquo; - theme should follow your OS preference</p>
              <p>4. <strong>System Test:</strong> Change your OS theme setting and see the page automatically update</p>
              <p>5. <strong>Persistence:</strong> Refresh the page - your selection should be remembered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}