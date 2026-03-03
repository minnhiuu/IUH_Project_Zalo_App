import React from 'react'
import { Animated, Text, TouchableOpacity, View, TextInput, StyleProp, ViewStyle } from 'react-native'
import { SearchHeader } from './search-header'

export interface TabItem {
  key: string
  label: string
}

interface SearchTopBarProps {
  searchQuery: string
  setSearchQuery: (text: string) => void
  placeholder?: string
  onBack?: () => void
  onClear?: () => void
  inputRef?: React.Ref<TextInput>
  tabs?: TabItem[]
  activeTab?: string | null
  setActiveTab?: (key: any) => void
  style?: StyleProp<ViewStyle>
  showQr?: boolean
  onQrPress?: () => void
  onPress?: () => void
  rightAction?: React.ReactNode
  onSubmitEditing?: () => void
}

export function SearchTopBar({
  searchQuery,
  setSearchQuery,
  placeholder,
  onBack,
  onClear,
  inputRef,
  tabs = [],
  activeTab,
  setActiveTab,
  style,
  showQr,
  onQrPress,
  onPress,
  rightAction,
  onSubmitEditing
}: SearchTopBarProps) {
  return (
    <Animated.View style={style}>
      <SearchHeader
        ref={inputRef}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        onBack={onBack}
        onClear={onClear}
        showQr={showQr}
        onQrPress={onQrPress}
        onPress={onPress}
        rightAction={rightAction}
        onSubmitEditing={onSubmitEditing}
      />

      {tabs.length > 0 && setActiveTab && (
        <View className='bg-background flex-row border-b border-divider'>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} className='flex-1 items-center py-3'>
              <Text
                className={`text-sm font-medium ${activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {tab.label}
              </Text>
              {activeTab === tab.key && <View className='absolute bottom-0 w-full h-[3px] bg-primary' />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  )
}
