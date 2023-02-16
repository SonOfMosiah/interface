import { LinearGradient } from 'expo-linear-gradient'
import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { FadeIn } from 'react-native-reanimated'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import { useAppDispatch, useAppSelector, useAppTheme } from 'src/app/hooks'
import HeartIcon from 'src/assets/icons/heart.svg'
import SendIcon from 'src/assets/icons/send.svg'
import { AddressDisplay } from 'src/components/AddressDisplay'
import { BackButton } from 'src/components/buttons/BackButton'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { AnimatedBox } from 'src/components/layout/Box'
import { Flex } from 'src/components/layout/Flex'
import { useUniconColors } from 'src/components/unicons/utils'
import { useENSAvatar } from 'src/features/ens/api'
import { ProfileContextMenu } from 'src/features/externalProfile/ProfileContextMenu'
import { selectWatchedAddressSet } from 'src/features/favorites/selectors'
import { addWatchedAddress, removeWatchedAddress } from 'src/features/favorites/slice'
import { openModal } from 'src/features/modals/modalSlice'
import { ElementName, ModalName } from 'src/features/telemetry/constants'
import { CurrencyField } from 'src/features/transactions/transactionState/transactionState'
import { useExtractedColors } from 'src/utils/colors'

const HEADER_GRADIENT_HEIGHT = 137
const HEADER_ICON_SIZE = 72

interface ProfileHeaderProps {
  address: Address
}

export default function ProfileHeader({ address }: ProfileHeaderProps): JSX.Element {
  const theme = useAppTheme()
  const dispatch = useAppDispatch()
  const isFavorited = useAppSelector(selectWatchedAddressSet).has(address)

  // ENS avatar and avatar colors
  const { data: avatar, isLoading } = useENSAvatar(address)
  const { colors: avatarColors } = useExtractedColors(avatar)
  const hasAvatar = !!avatar && !isLoading

  // Unicon colors
  const { gradientStart: uniconGradientStart, gradientEnd: uniconGradientEnd } =
    useUniconColors(address)

  // Wait for avatar, then render avatar extracted colors or unicon colors if no avatar
  const fixedGradientColors = useMemo(() => {
    if (isLoading || (hasAvatar && !avatarColors)) {
      return [theme.colors.background0, theme.colors.background0]
    }
    if (hasAvatar && avatarColors) {
      return [avatarColors.background, avatarColors.background]
    }
    return [uniconGradientStart, uniconGradientEnd]
  }, [
    avatarColors,
    hasAvatar,
    isLoading,
    theme.colors.background0,
    uniconGradientEnd,
    uniconGradientStart,
  ])

  const onPressFavorite = (): void => {
    if (isFavorited) {
      dispatch(removeWatchedAddress({ address }))
    } else {
      dispatch(addWatchedAddress({ address }))
    }
  }

  const initialSendState = useMemo(() => {
    return {
      recipient: address,
      exactAmountToken: '',
      exactAmountUSD: '',
      exactCurrencyField: CurrencyField.INPUT,
      [CurrencyField.INPUT]: null,
      [CurrencyField.OUTPUT]: null,
    }
  }, [address])

  const onPressSend = useCallback(() => {
    dispatch(
      openModal({
        name: ModalName.Send,
        ...{ initialState: initialSendState },
      })
    )
  }, [dispatch, initialSendState])

  return (
    <Flex bg="background0" gap="spacing16" pt="spacing36" px="spacing24">
      {/* fixed gradient */}
      <AnimatedBox
        bottom={0}
        entering={FadeIn}
        height={HEADER_GRADIENT_HEIGHT}
        left={0}
        position="absolute"
        right={0}
        top={0}>
        <LinearGradient
          colors={fixedGradientColors}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {hasAvatar && avatarColors?.primary ? <HeaderRadial color={avatarColors.primary} /> : null}
      </AnimatedBox>

      {/* header row */}
      <Flex row alignItems="center" justifyContent="space-between" mx="spacing4">
        <TouchableArea
          backgroundColor="textOnDimTertiary"
          borderRadius="roundedFull"
          opacity={0.8}
          padding="spacing8">
          <Flex centered grow height={theme.iconSizes.icon16} width={theme.iconSizes.icon16}>
            <BackButton color="white" size={theme.iconSizes.icon24} />
          </Flex>
        </TouchableArea>
        <ProfileContextMenu address={address} />
      </Flex>

      {/* button content */}
      <Flex row alignItems="flex-start" justifyContent="space-between">
        <AddressDisplay
          address={address}
          captionVariant="buttonLabelMedium"
          contentAlign="flex-start"
          direction="column"
          disableViewOnlyIcon={true}
          showCopy={true}
          showIconBackground={true}
          size={HEADER_ICON_SIZE}
          textAlign="flex-start"
          variant="headlineSmall"
        />
        <Flex centered row gap="spacing8" mt="spacing12">
          <TouchableArea
            hapticFeedback
            activeOpacity={1}
            backgroundColor="background0"
            borderColor="backgroundOutline"
            borderRadius="rounded16"
            borderWidth={1}
            name={ElementName.Send}
            padding="spacing12"
            onPress={onPressSend}>
            <SendIcon
              color={theme.colors.textSecondary}
              height={theme.iconSizes.icon24}
              strokeWidth={2}
              width={theme.iconSizes.icon24}
            />
          </TouchableArea>
          <TouchableArea
            hapticFeedback
            activeOpacity={1}
            backgroundColor="background0"
            borderColor="backgroundOutline"
            borderRadius="rounded16"
            borderWidth={1}
            name={ElementName.Favorite}
            padding="spacing12"
            onPress={onPressFavorite}>
            {isFavorited ? <HeartIconFilled /> : <HeartIconEmpty />}
          </TouchableArea>
        </Flex>
      </Flex>
    </Flex>
  )
}

const HeartIconEmpty = (): JSX.Element => {
  const theme = useAppTheme()
  return (
    <HeartIcon
      height={theme.iconSizes.icon24}
      stroke={theme.colors.textSecondary}
      strokeWidth={2.5}
      width={theme.iconSizes.icon24}
    />
  )
}

const HeartIconFilled = (): JSX.Element => {
  const theme = useAppTheme()
  return (
    <HeartIcon
      fill={theme.colors.accentAction}
      height={theme.iconSizes.icon24}
      stroke={theme.colors.accentAction}
      strokeWidth={2}
      width={theme.iconSizes.icon24}
    />
  )
}

function _HeaderRadial({ color }: { color: string }): JSX.Element {
  return (
    <Svg height="100%" width="100%">
      <Defs>
        <RadialGradient cy="-0.1" id="background" rx="0.8" ry="1.1">
          <Stop offset="0" stopColor={color} stopOpacity="0.6" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect fill="url(#background)" height="100%" opacity={0.6} width="100%" x="0" y="0" />
    </Svg>
  )
}

export const HeaderRadial = memo(_HeaderRadial)
