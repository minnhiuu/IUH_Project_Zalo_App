import { useState, useCallback, useRef } from 'react'
import * as Contacts from 'expo-contacts'
import * as SecureStore from 'expo-secure-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contactApi } from '../api/contact.api'
import type { ContactEntry } from '../api/contact.api'
import { friendKeys } from '../queries/keys'

const LAST_SYNC_KEY = 'contact_sync_last_time'
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  // Vietnam: convert 0xx to +84xx
  if (digits.startsWith('0') && digits.length >= 9) {
    return '+84' + digits.slice(1)
  }
  if (digits.startsWith('+')) return digits
  return digits
}

function extractPhoneContacts(contacts: Contacts.Contact[]): ContactEntry[] {
  const entries: ContactEntry[] = []
  for (const contact of contacts) {
    const phones = (contact.phoneNumbers || [])
      .map((p) => normalizePhone(p.number || ''))
      .filter((p) => p.length >= 9)

    if (phones.length === 0) continue

    entries.push({
      name: [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown',
      phones: [...new Set(phones)],
      emails: []
    })
  }
  return entries
}

export function useContactSync() {
  const [syncing, setSyncing] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<{
    matchedUsers: number
    totalContacts: number
  } | null>(null)
  const queryClient = useQueryClient()
  const syncingRef = useRef(false)

  const importMutation = useMutation({
    mutationFn: contactApi.importContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.contactSuggestions() })
      queryClient.invalidateQueries({ queryKey: friendKeys.unifiedSuggestions() })
    }
  })

  const shouldSync = useCallback(async (): Promise<boolean> => {
    const lastSync = await SecureStore.getItemAsync(LAST_SYNC_KEY)
    if (!lastSync) return true
    return Date.now() - parseInt(lastSync, 10) > SYNC_INTERVAL_MS
  }, [])

  const syncContacts = useCallback(
    async (force = false) => {
      if (syncingRef.current) return null
      if (!force) {
        const needed = await shouldSync()
        if (!needed) return null
      }

      syncingRef.current = true
      setSyncing(true)
      setPermissionDenied(false)

      try {
        const { status } = await Contacts.requestPermissionsAsync()
        if (status !== 'granted') {
          setPermissionDenied(true)
          return null
        }

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers]
        })

        const entries = extractPhoneContacts(data)
        if (entries.length === 0) return null

        // Batch in chunks of 500 (backend limit)
        const BATCH_SIZE = 500
        let totalMatched = 0
        for (let i = 0; i < entries.length; i += BATCH_SIZE) {
          const batch = entries.slice(i, i + BATCH_SIZE)
          const response = await contactApi.importContacts({ contacts: batch })
          totalMatched += response.data.data.matchedUsers
        }

        await SecureStore.setItemAsync(LAST_SYNC_KEY, Date.now().toString())

        // Invalidate suggestions after sync
        queryClient.invalidateQueries({ queryKey: friendKeys.contactSuggestions() })
        queryClient.invalidateQueries({ queryKey: friendKeys.unifiedSuggestions() })

        const result = { matchedUsers: totalMatched, totalContacts: entries.length }
        setLastSyncResult(result)
        return result
      } catch (error) {
        console.error('[ContactSync] Error:', error)
        return null
      } finally {
        setSyncing(false)
        syncingRef.current = false
      }
    },
    [shouldSync, queryClient]
  )

  return {
    syncContacts,
    syncing,
    permissionDenied,
    lastSyncResult,
    importMutation
  }
}
