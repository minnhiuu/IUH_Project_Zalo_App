import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  PanResponder,
  type PanResponderGestureState,
  type GestureResponderEvent,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { Video, ResizeMode } from 'expo-av'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import * as ImageManipulator from 'expo-image-manipulator'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { captureRef } from 'react-native-view-shot'
import { fileApi } from '@/features/social-feed/api'
import { useCreateSocialPostMutation } from '@/features/social-feed/queries/use-mutations'


type CaptureMode = 'PHOTO' | 'VIDEO'
type StoryVisibility = 'ALL' | 'FRIEND' | 'ONLY_ME'

type OverlayType = 'TEXT' | 'EMOJI'

interface OverlayItem {
  id: string
  type: OverlayType
  content: string
  x: number
  y: number
  scale: number
}

interface StoryDraft {
  uri: string
  type: 'IMAGE' | 'VIDEO'
  width?: number
  height?: number
}

const VISIBILITY_OPTIONS: Array<{ value: StoryVisibility; label: string }> = [
  { value: 'ALL', label: 'Công khai' },
  { value: 'FRIEND', label: 'Bạn bè' },
  { value: 'ONLY_ME', label: 'Chỉ mình tôi' }
]

const EMOJI_STICKERS = ['😀', '😂', '😍', '🥰', '😎', '🤩', '😭', '😡', '👍', '❤️', '🔥', '🎉', '🌟', '🥳', '🤙']
const SCREEN = Dimensions.get('window')

const clampScale = (value: number) => Math.max(0.6, Math.min(3.2, value))

const getTouchDistance = (event: GestureResponderEvent) => {
  const touches = event.nativeEvent.touches
  if (touches.length < 2) return 0

  const firstTouch = touches[0]
  const secondTouch = touches[1]
  const deltaX = secondTouch.pageX - firstTouch.pageX
  const deltaY = secondTouch.pageY - firstTouch.pageY

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

function EditableOverlay({
  item,
  selected,
  onSelect,
  onCommit
}: {
  item: OverlayItem
  selected: boolean
  onSelect: (id: string) => void
  onCommit: (id: string, patch: Partial<OverlayItem>) => void
}) {
  const translateX = useRef(new Animated.Value(item.x)).current
  const translateY = useRef(new Animated.Value(item.y)).current
  const scaleAnimated = useRef(new Animated.Value(item.scale)).current

  const baseXRef = useRef(item.x)
  const baseYRef = useRef(item.y)
  const baseScaleRef = useRef(item.scale)
  const currentXRef = useRef(item.x)
  const currentYRef = useRef(item.y)
  const currentScaleRef = useRef(item.scale)
  const initialPinchDistanceRef = useRef(0)

  useEffect(() => {
    translateX.setValue(item.x)
    translateY.setValue(item.y)
    scaleAnimated.setValue(item.scale)
    currentXRef.current = item.x
    currentYRef.current = item.y
    currentScaleRef.current = item.scale
  }, [item.id, item.x, item.y, item.scale, translateX, translateY, scaleAnimated])

  const commitTransform = () => {
    onCommit(item.id, {
      x: currentXRef.current,
      y: currentYRef.current,
      scale: currentScaleRef.current
    })
  }

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (event) => {
        onSelect(item.id)
        baseXRef.current = currentXRef.current
        baseYRef.current = currentYRef.current
        baseScaleRef.current = currentScaleRef.current
        initialPinchDistanceRef.current = getTouchDistance(event)
      },
      onPanResponderMove: (event, gestureState: PanResponderGestureState) => {
        const pinchDistance = getTouchDistance(event)

        if (pinchDistance > 0) {
          if (initialPinchDistanceRef.current === 0) {
            initialPinchDistanceRef.current = pinchDistance
            baseScaleRef.current = currentScaleRef.current
            return
          }

          const pinchRatio = pinchDistance / initialPinchDistanceRef.current
          const nextScale = clampScale(baseScaleRef.current * pinchRatio)
          scaleAnimated.setValue(nextScale)
          currentScaleRef.current = nextScale
          return
        }

        if (initialPinchDistanceRef.current !== 0) {
          initialPinchDistanceRef.current = 0
          baseXRef.current = currentXRef.current
          baseYRef.current = currentYRef.current
        }

        const nextX = baseXRef.current + gestureState.dx
        const nextY = baseYRef.current + gestureState.dy
        translateX.setValue(nextX)
        translateY.setValue(nextY)
        currentXRef.current = nextX
        currentYRef.current = nextY
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: () => {
        initialPinchDistanceRef.current = 0
        commitTransform()
      },
      onPanResponderTerminate: () => {
        initialPinchDistanceRef.current = 0
        commitTransform()
      }
    })
  ).current

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.overlayItem,
        {
          left: 0,
          top: 0,
          transform: [{ translateX }, { translateY }, { scale: scaleAnimated }],
          borderWidth: selected ? 1 : 0,
          borderColor: 'rgba(255,255,255,0.8)'
        }
      ]}
    >
      <Text style={item.type === 'TEXT' ? styles.overlayText : styles.overlayEmoji}>{item.content}</Text>
    </Animated.View>
  )
}

export default function StoryCaptureScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const cameraRef = useRef<any>(null)
  const previewCaptureRef = useRef<View>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions()
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [captureMode, setCaptureMode] = useState<CaptureMode>('PHOTO')
  const [draft, setDraft] = useState<StoryDraft | null>(null)
  const [textDraft, setTextDraft] = useState('')
  const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([])
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<StoryVisibility>('ALL')
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isEditingImage, setIsEditingImage] = useState(false)

  const createPostMutation = useCreateSocialPostMutation()

  useEffect(() => {
    if (!permission) return
    if (!permission.granted && permission.canAskAgain) {
      void requestPermission()
    }
  }, [permission, requestPermission])

  const resolveImageSize = async (item: StoryDraft) => {
    if (item.width && item.height) {
      return { width: item.width, height: item.height }
    }

    return await new Promise<{ width: number; height: number }>((resolve, reject) => {
      Image.getSize(item.uri, (width, height) => resolve({ width, height }), reject)
    })
  }

  const createStoryFromUri = async (
    uri: string,
    type: 'IMAGE' | 'VIDEO',
    visibilityValue: StoryVisibility
  ) => {
    try {
      setIsUploading(true)
      console.log('[StoryUpload] start', {
        type,
        visibility: visibilityValue,
        uri
      })
      const uploadResults = await fileApi.uploadBatchWithPresigned([{ uri, type }])
      const uploadedMediaKey = uploadResults[0]?.key

      console.log('[StoryUpload] success', {
        type,
        key: uploadedMediaKey,
        count: uploadResults.length
      })

      if (!uploadedMediaKey) {
        throw new Error('Missing uploaded media key')
      }

      const payload: {
        postType: 'STORY'
        visibility: StoryVisibility
        media: Array<{ url: string; type: 'IMAGE' | 'VIDEO' }>
      } = {
        postType: 'STORY',
        visibility: visibilityValue,
        media: [
          {
            url: uploadedMediaKey,
            type
          }
        ]
      }

      await createPostMutation.mutateAsync(payload)

      Alert.alert('Thành công', 'Đã đăng khoảnh khắc mới.')
      router.back()
    } catch (error) {
      console.error('Create story failed:', error)
      Alert.alert('Lỗi', 'Không thể đăng khoảnh khắc. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePostStory = async () => {
    if (!draft || isUploading) return

    let uploadUri = draft.uri

    if (draft.type === 'IMAGE' && overlayItems.length > 0 && previewCaptureRef.current) {
      try {
        uploadUri = await captureRef(previewCaptureRef, {
          format: 'jpg',
          quality: 1,
          result: 'tmpfile'
        })
      } catch (error) {
        console.error('Capture composed image failed:', error)
        Alert.alert('Lỗi', 'Không thể áp dụng sticker/text lên ảnh.')
        return
      }
    }

    if (draft.type === 'VIDEO' && overlayItems.length > 0) {
      Alert.alert('Lưu ý', 'Text/sticker mới áp dụng cho ảnh. Video sẽ đăng bản gốc.')
    }

    await createStoryFromUri(uploadUri, draft.type, visibility)
  }

  const handleSaveDraftToLibrary = async () => {
    if (!draft || isUploading) return

    const mediaPermission = await MediaLibrary.requestPermissionsAsync()
    if (mediaPermission.status !== 'granted') {
      Alert.alert('Cần quyền thư viện', 'Vui lòng cấp quyền để lưu ảnh/video vào thư viện.')
      return
    }

    try {
      await MediaLibrary.createAssetAsync(draft.uri)
      Alert.alert('Thành công', 'Đã lưu vào thư viện.')
    } catch (error) {
      console.error('Save to library failed:', error)
      Alert.alert('Lỗi', 'Không thể lưu tệp vào thư viện.')
    }
  }

  const handleOpenTextEditor = () => {
    setTextDraft('')
    setShowTextModal(true)
  }

  const addOverlayItem = (type: OverlayType, content: string) => {
    const itemId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const nextItem: OverlayItem = {
      id: itemId,
      type,
      content,
      x: SCREEN.width * 0.5 - 60,
      y: SCREEN.height * 0.4,
      scale: 1
    }

    setOverlayItems((previous) => [...previous, nextItem])
    setSelectedOverlayId(itemId)
  }

  const commitOverlayItem = (id: string, patch: Partial<OverlayItem>) => {
    setOverlayItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          ...patch
        }
      })
    )
  }

  const handleRemoveSelectedOverlay = () => {
    if (!selectedOverlayId) return
    setOverlayItems((previous) => previous.filter((item) => item.id !== selectedOverlayId))
    setSelectedOverlayId(null)
  }

  const applyCenterCrop = async (targetRatio: number) => {
    if (!draft || draft.type !== 'IMAGE' || isEditingImage || isUploading) return

    try {
      setIsEditingImage(true)
      const { width, height } = await resolveImageSize(draft)

      let cropWidth = width
      let cropHeight = cropWidth / targetRatio

      if (cropHeight > height) {
        cropHeight = height
        cropWidth = cropHeight * targetRatio
      }

      const finalCropWidth = Math.max(1, Math.floor(cropWidth))
      const finalCropHeight = Math.max(1, Math.floor(cropHeight))
      const originX = Math.max(0, Math.floor((width - finalCropWidth) / 2))
      const originY = Math.max(0, Math.floor((height - finalCropHeight) / 2))

      const cropped = await ImageManipulator.manipulateAsync(
        draft.uri,
        [
          {
            crop: {
              originX,
              originY,
              width: finalCropWidth,
              height: finalCropHeight
            }
          }
        ],
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG
        }
      )

      setDraft({
        ...draft,
        uri: cropped.uri,
        width: finalCropWidth,
        height: finalCropHeight
      })
      setOverlayItems([])
      setSelectedOverlayId(null)
    } catch (error) {
      console.error('Crop image failed:', error)
      Alert.alert('Lỗi', 'Không thể cắt ảnh. Vui lòng thử lại.')
    } finally {
      setIsEditingImage(false)
    }
  }

  const handleCropImage = () => {
    if (!draft || draft.type !== 'IMAGE') return

    Alert.alert('Cắt ảnh', 'Chọn tỉ lệ cắt', [
      { text: '1:1', onPress: () => void applyCenterCrop(1) },
      { text: '4:5', onPress: () => void applyCenterCrop(4 / 5) },
      { text: '9:16', onPress: () => void applyCenterCrop(9 / 16) },
      { text: 'Hủy', style: 'cancel' }
    ])
  }

  const handlePickFromLibrary = async () => {
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (mediaPermission.status !== 'granted') {
      Alert.alert(
        'Cần quyền thư viện',
        'Vui lòng cấp quyền truy cập ảnh để chọn từ album.',
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Mở cài đặt',
            onPress: () => {
              void Linking.openSettings()
            }
          }
        ]
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 1,
      videoMaxDuration: 60
    })

    if (result.canceled || !result.assets[0]) {
      return
    }

    const selectedAsset = result.assets[0]
    setDraft({
      uri: selectedAsset.uri,
      type: selectedAsset.type === 'video' ? 'VIDEO' : 'IMAGE',
      width: selectedAsset.width,
      height: selectedAsset.height
    })
    setOverlayItems([])
    setSelectedOverlayId(null)
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isUploading) return

    if (captureMode === 'PHOTO') {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 })
        if (photo?.uri) {
          setDraft({
            uri: photo.uri,
            type: 'IMAGE',
            width: photo.width,
            height: photo.height
          })
          setOverlayItems([])
          setSelectedOverlayId(null)
        }
      } catch (error) {
        console.error('Capture photo failed:', error)
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.')
      }

      return
    }

    const hasMicPermission = microphonePermission?.granted === true
    if (!hasMicPermission) {
      const requestedPermission = await requestMicrophonePermission()
      if (!requestedPermission.granted) {
        Alert.alert('Cần quyền micro', 'Vui lòng cấp quyền micro để quay video có âm thanh.')
        return
      }
    }

    if (isRecording) {
      cameraRef.current.stopRecording()
      return
    }

    try {
      setIsRecording(true)
      const video = await cameraRef.current.recordAsync({ maxDuration: 60 })
      if (video?.uri) {
        setDraft({
          uri: video.uri,
          type: 'VIDEO'
        })
        setOverlayItems([])
        setSelectedOverlayId(null)
      }
    } catch (error) {
      console.error('Record video failed:', error)
      Alert.alert('Lỗi', 'Không thể quay video. Vui lòng thử lại.')
    } finally {
      setIsRecording(false)
    }
  }

  if (draft) {
    return (
      <View style={styles.container}>
        <View ref={previewCaptureRef} collapsable={false} style={StyleSheet.absoluteFillObject}>
          {draft.type === 'VIDEO' ? (
            <Video
              source={{ uri: draft.uri }}
              style={StyleSheet.absoluteFillObject}
              shouldPlay
              isLooping
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : (
            <Image source={{ uri: draft.uri }} style={StyleSheet.absoluteFillObject} resizeMode='contain' />
          )}

          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSelectedOverlayId(null)} />

          {overlayItems.map((item) => (
            <EditableOverlay
              key={item.id}
              item={item}
              selected={selectedOverlayId === item.id}
              onSelect={setSelectedOverlayId}
              onCommit={commitOverlayItem}
            />
          ))}
        </View>

        <SafeAreaView style={styles.overlay} edges={['bottom']} pointerEvents='box-none'>
          <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setDraft(null)} disabled={isUploading}>
              <Ionicons name='chevron-back' size={28} color='#fff' />
            </TouchableOpacity>

            <View style={styles.previewRightActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleOpenTextEditor} disabled={isUploading}>
                <Text style={styles.aaText}>Aa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowEmojiModal(true)}
                disabled={isUploading}
              >
                <Ionicons name='happy-outline' size={24} color='#fff' />
              </TouchableOpacity>
              {draft.type === 'IMAGE' && (
                <TouchableOpacity style={styles.iconButton} onPress={handleCropImage} disabled={isUploading || isEditingImage}>
                  {isEditingImage ? (
                    <ActivityIndicator size='small' color='#fff' />
                  ) : (
                    <Ionicons name='crop-outline' size={24} color='#fff' />
                  )}
                </TouchableOpacity>
              )}
              {selectedOverlayId ? (
                <TouchableOpacity style={styles.iconButton} onPress={handleRemoveSelectedOverlay} disabled={isUploading}>
                  <Ionicons name='trash-outline' size={22} color='#fff' />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.previewBottomRow}>
            <View style={styles.previewBottomLeftActions}>
              <TouchableOpacity style={styles.previewBottomAction} onPress={() => setShowVisibilityModal(true)} disabled={isUploading}>
                <Ionicons name='person-add-outline' size={20} color='#fff' />
                <Text style={styles.previewBottomActionText}>Quyền xem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewBottomAction} onPress={handleSaveDraftToLibrary} disabled={isUploading}>
                <Ionicons name='download-outline' size={20} color='#fff' />
                <Text style={styles.previewBottomActionText}>Tải về</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.postButton} onPress={handlePostStory} disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator size='small' color='#fff' />
              ) : (
                <Text style={styles.postButtonText}>Đăng</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <Modal
          visible={showVisibilityModal}
          transparent
          animationType='slide'
          onRequestClose={() => setShowVisibilityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowVisibilityModal(false)} />
            <View style={styles.bottomSheet}>
              <Text style={styles.bottomSheetTitle}>Chọn quyền xem</Text>
              {VISIBILITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.bottomSheetOption}
                  onPress={() => {
                    setVisibility(option.value)
                    setShowVisibilityModal(false)
                  }}
                >
                  <Text style={styles.bottomSheetOptionLabel}>{option.label}</Text>
                  {visibility === option.value ? <Ionicons name='checkmark' size={20} color='#2563eb' /> : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showTextModal}
          transparent
          animationType='fade'
          onRequestClose={() => setShowTextModal(false)}
        >
          <View style={styles.modalOverlayCenter}>
            <View style={styles.captionModalCard}>
              <Text style={styles.captionModalTitle}>Thêm chữ</Text>
              <TextInput
                value={textDraft}
                onChangeText={setTextDraft}
                placeholder='Nhập nội dung...'
                placeholderTextColor='#9CA3AF'
                multiline
                className='text-black'
                style={styles.captionInput}
                autoFocus
              />
              <View style={styles.captionModalActions}>
                <TouchableOpacity style={styles.captionModalActionButton} onPress={() => setShowTextModal(false)}>
                  <Text style={styles.captionModalActionText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.captionModalActionButton, styles.captionModalSaveButton]}
                  onPress={() => {
                    const nextText = textDraft.trim()
                    if (nextText) {
                      addOverlayItem('TEXT', nextText)
                    }
                    setTextDraft('')
                    setShowTextModal(false)
                  }}
                >
                  <Text style={styles.captionModalSaveText}>Xong</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showEmojiModal}
          transparent
          animationType='slide'
          onRequestClose={() => setShowEmojiModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowEmojiModal(false)} />
            <View style={styles.bottomSheet}>
              <Text style={styles.bottomSheetTitle}>Chọn sticker/emoji</Text>
              <View style={styles.emojiGrid}>
                {EMOJI_STICKERS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.emojiButton}
                    onPress={() => {
                      addOverlayItem('EMOJI', emoji)
                      setShowEmojiModal(false)
                    }}
                  >
                    <Text style={styles.emojiButtonText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    )
  }

  if (!permission) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size='large' color='#fff' />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.permissionText}>Ứng dụng cần quyền camera để tạo khoảnh khắc.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Cấp quyền camera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        mode={captureMode === 'VIDEO' ? 'video' : 'picture'}
      />

      <SafeAreaView style={styles.overlay} edges={['bottom']} pointerEvents='box-none'>
        <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={28} color='#fff' />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
          >
            <Ionicons name='camera-reverse-outline' size={24} color='#fff' />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControlsWrapper}>
          <View style={styles.modeTabs}>
            <TouchableOpacity onPress={() => setCaptureMode('PHOTO')} style={styles.modeTabButton}>
              <Text style={captureMode === 'PHOTO' ? styles.modeTextActive : styles.modeText}>PHOTO</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCaptureMode('VIDEO')} style={styles.modeTabButton}>
              <Text style={captureMode === 'VIDEO' ? styles.modeTextActive : styles.modeText}>VIDEO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.captureRow}>
            <View style={styles.sidePlaceholder} />

            <TouchableOpacity
              style={[
                styles.captureButton,
                captureMode === 'VIDEO' && isRecording ? styles.captureButtonRecording : null
              ]}
              onPress={handleCapture}
              disabled={isUploading}
            >
              <View
                style={[
                  styles.captureButtonInner,
                  captureMode === 'VIDEO' && isRecording ? styles.captureButtonInnerRecording : null
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideActionButton} onPress={handlePickFromLibrary} disabled={isUploading || isRecording}>
              {isUploading ? <ActivityIndicator size='small' color='#fff' /> : <Ionicons name='images-outline' size={26} color='#fff' />}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between'
  },
  centeredScreen: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  aaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 24
  },
  overlayItem: {
    position: 'absolute',
    minWidth: 34,
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)'
  },
  overlayText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  overlayEmoji: {
    fontSize: 40
  },
  previewRightActions: {
    alignItems: 'center',
    gap: 10
  },
  previewBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 12
  },
  previewBottomLeftActions: {
    flexDirection: 'row',
    gap: 12
  },
  previewBottomAction: {
    width: 82,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  previewBottomActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  postButton: {
    minWidth: 94,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF'
  },
  postButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10
  },
  bottomSheetOption: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bottomSheetOptionLabel: {
    fontSize: 16,
    color: '#111827'
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  emojiButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6'
  },
  emojiButtonText: {
    fontSize: 28
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  captionModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14
  },
  captionModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    minHeight: 88,
    maxHeight: 160,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top'
  },
  captionModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12
  },
  captionModalActionButton: {
    height: 38,
    minWidth: 74,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12
  },
  captionModalActionText: {
    color: '#111827',
    fontWeight: '600'
  },
  captionModalSaveButton: {
    backgroundColor: '#2563eb'
  },
  captionModalSaveText: {
    color: '#fff',
    fontWeight: '700'
  },
  bottomControlsWrapper: {
    paddingBottom: 16,
    paddingHorizontal: 20
  },
  modeTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 28
  },
  modeTabButton: {
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  modeText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    fontWeight: '600'
  },
  modeTextActive: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800'
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sideActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  sidePlaceholder: {
    width: 48,
    height: 48
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  captureButtonRecording: {
    borderColor: '#ff3b30'
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff'
  },
  captureButtonInnerRecording: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ff3b30'
  }
})
