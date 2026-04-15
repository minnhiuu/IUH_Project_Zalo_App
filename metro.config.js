const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs', 'jsx', 'tsx']

config.resolver.unstable_enablePackageExports = true

module.exports = withNativeWind(config, { input: './global.css' })
