import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, StyleSheet } from 'react-native'
import { useAppDispatch } from 'src/app/hooks'
import { SettingsStackParamList } from 'src/app/navigation/types'
import { BackHeader } from 'src/components/layout/BackHeader'
import { Screen } from 'src/components/layout/Screen'
import { UnitagBanner } from 'src/components/unitags/UnitagBanner'
import { Button, Flex, Icons, Text } from 'ui/src'
import { fonts } from 'ui/src/theme'
import { TextInput } from 'wallet/src/components/input/TextInput'
import { NICKNAME_MAX_LENGTH } from 'wallet/src/constants/accounts'
import { ChainId } from 'wallet/src/constants/chains'
import { useENS } from 'wallet/src/features/ens/useENS'
import { FEATURE_FLAGS } from 'wallet/src/features/experiments/constants'
import { useFeatureFlag } from 'wallet/src/features/experiments/hooks'
import {
  EditAccountAction,
  editAccountActions,
} from 'wallet/src/features/wallet/accounts/editAccountSaga'
import { AccountType } from 'wallet/src/features/wallet/accounts/types'
import { useAccounts } from 'wallet/src/features/wallet/hooks'
import { shortenAddress } from 'wallet/src/utils/addresses'
import { isIOS } from 'wallet/src/utils/platform'
import { Screens } from './Screens'

type Props = NativeStackScreenProps<SettingsStackParamList, Screens.SettingsWalletEdit>

export function SettingsWalletEdit({
  route: {
    params: { address },
  },
}: Props): JSX.Element {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeAccount = useAccounts()[address]
  const ensName = useENS(ChainId.Mainnet, address)?.name
  const [nickname, setNickname] = useState(ensName || activeAccount?.name)
  const [initialNickname, setInitialNickname] = useState(ensName || activeAccount?.name)
  const [showEditInput, setShowEditInput] = useState(false)
  const unitagsFeatureFlagEnabled = useFeatureFlag(FEATURE_FLAGS.Unitags)
  const showUnitagBanner =
    unitagsFeatureFlagEnabled && activeAccount?.type === AccountType.SignerMnemonic

  const onPressShowEditInput = (): void => {
    setShowEditInput(true)
  }

  const onFinishEditing = (): void => {
    Keyboard.dismiss()
    setShowEditInput(false)
    setNickname(nickname?.trim())
  }

  const handleNicknameUpdate = (): void => {
    onFinishEditing()
    dispatch(
      editAccountActions.trigger({
        type: EditAccountAction.Rename,
        address,
        newName: nickname?.trim() ?? '',
      })
    )
  }

  const onPressSaveChanges = (): void => {
    handleNicknameUpdate()
    setInitialNickname(nickname)
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        enabled
        behavior={isIOS ? 'padding' : undefined}
        contentContainerStyle={styles.expand}
        style={styles.base}>
        <BackHeader alignment="center" mx="$spacing16" pt="$spacing16">
          <Text variant="body1">{t('Edit Label')}</Text>
        </BackHeader>
        <Flex
          grow
          gap="$spacing36"
          justifyContent="space-between"
          pb="$spacing16"
          pt="$spacing24"
          px="$spacing24">
          <Flex>
            <Flex
              row
              alignItems="center"
              borderColor="$surface3"
              borderRadius="$rounded16"
              borderWidth="$spacing1"
              px="$spacing24"
              py="$spacing12">
              {showEditInput ? (
                <TextInput
                  autoFocus
                  autoCapitalize="none"
                  color={nickname === activeAccount?.name ? '$neutral3' : '$neutral1'}
                  fontFamily="$subHeading"
                  fontSize={fonts.subheading1.fontSize}
                  margin="$none"
                  maxLength={NICKNAME_MAX_LENGTH}
                  numberOfLines={1}
                  placeholder={shortenAddress(address)}
                  placeholderTextColor="$neutral3"
                  px="$none"
                  py="$spacing8"
                  returnKeyType="done"
                  value={nickname}
                  width="100%"
                  onChangeText={setNickname}
                  onSubmitEditing={onFinishEditing}
                />
              ) : (
                <Flex grow row alignItems="center" justifyContent="space-between">
                  <Flex shrink flex={1}>
                    <Text color="$neutral1" variant="subheading1">
                      {nickname || shortenAddress(address)}
                    </Text>
                  </Flex>
                  {!ensName && (
                    <Flex ml="$spacing12">
                      <Button
                        backgroundless
                        icon={<Icons.PenLine color="$neutral3" />}
                        m="$none"
                        size="medium"
                        onPress={onPressShowEditInput}
                      />
                    </Flex>
                  )}
                </Flex>
              )}
            </Flex>
            <Flex px="$spacing8" py="$spacing12">
              <Text color="$neutral3">
                {t('Labels are not public. They are stored locally and only visible to you.')}
              </Text>
            </Flex>
            {showUnitagBanner && <UnitagBanner compact />}
          </Flex>
          <Button
            hapticFeedback
            disabled={nickname === initialNickname}
            size="medium"
            theme="primary"
            onPress={onPressSaveChanges}>
            {t('Save changes')}
          </Button>
        </Flex>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  expand: {
    flexGrow: 1,
  },
})
