import { notificationAsync, selectionAsync } from 'expo-haptics'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-native-qrcode-svg'
import 'react-native-reanimated'
import { useAppTheme } from 'src/app/hooks'
import ScanQRIcon from 'src/assets/icons/scan-qr.svg'
import { useDisplayName } from 'src/components/AddressDisplay'
import { Button } from 'src/components/buttons/Button'
import { Chevron } from 'src/components/icons/Chevron'
import { Box, Flex } from 'src/components/layout'
import { BottomSheetModal } from 'src/components/modals/BottomSheetModal'
import { Text } from 'src/components/Text'
import { ConnectedDappsList } from 'src/components/WalletConnect/ConnectedDapps/ConnectedDappsList'
import { QRCodeScanner } from 'src/components/WalletConnect/ScanSheet/QRCodeScanner'
import { WalletQRCode } from 'src/components/WalletConnect/ScanSheet/WalletQRCode'
import { ElementName, ModalName } from 'src/features/telemetry/constants'
import { useActiveAccount } from 'src/features/wallet/hooks'
import { useWalletConnect } from 'src/features/walletConnect/useWalletConnect'
import { connectToApp } from 'src/features/walletConnect/WalletConnect'
import { opacify } from 'src/utils/colors'

export enum WalletConnectModalState {
  Hidden,
  ScanQr,
  ConnectedDapps,
  WalletQr,
}

type Props = {
  isVisible: boolean
  initialScreenState?: WalletConnectModalState
  onClose: () => void
}

export function WalletConnectModal({
  initialScreenState = WalletConnectModalState.ScanQr,
  isVisible,
  onClose,
}: Props) {
  const { t } = useTranslation()
  const activeAccount = useActiveAccount()
  const { name, address } = useDisplayName(activeAccount?.address)
  const { sessions } = useWalletConnect(activeAccount?.address)

  const [currentScreenState, setCurrentScreenState] =
    useState<WalletConnectModalState>(initialScreenState)

  const theme = useAppTheme()

  const onScanCode = (uri: string) => {
    notificationAsync()

    if (!activeAccount) return
    connectToApp(uri, activeAccount.address)
    onClose()
  }

  const onPressBottomToggle = () => {
    selectionAsync()
    if (currentScreenState === WalletConnectModalState.ScanQr) {
      setCurrentScreenState(WalletConnectModalState.WalletQr)
    } else {
      setCurrentScreenState(WalletConnectModalState.ScanQr)
    }
  }

  const onPressShowConnectedDapps = () => {
    selectionAsync()
    setCurrentScreenState(WalletConnectModalState.ConnectedDapps)
  }

  const onPressShowScanQr = () => {
    selectionAsync()
    setCurrentScreenState(WalletConnectModalState.ScanQr)
  }

  if (!activeAccount || !address) return null

  return (
    <BottomSheetModal
      fullScreen
      hideHandlebar
      backgroundColor={theme.colors.mainBackground}
      isVisible={isVisible}
      name={ModalName.WalletConnectScan}
      onClose={onClose}>
      {currentScreenState === WalletConnectModalState.ConnectedDapps && (
        <ConnectedDappsList goBack={onPressShowScanQr} sessions={sessions} />
      )}
      {currentScreenState === WalletConnectModalState.ScanQr && (
        <QRCodeScanner
          numConnections={sessions.length}
          onPressConnections={onPressShowConnectedDapps}
          onScanCode={onScanCode}
        />
      )}
      {currentScreenState === WalletConnectModalState.WalletQr && (
        <WalletQRCode address={activeAccount.address} />
      )}
      <Flex mb="xl" mt="md" mx="md">
        <Button
          borderRadius="lg"
          name={ElementName.QRCodeModalToggle}
          p="md"
          style={{ backgroundColor: opacify(30, theme.colors.neutralContainer) }}
          onPress={onPressBottomToggle}>
          <Flex row gap="sm">
            {currentScreenState === WalletConnectModalState.ScanQr ? (
              <Flex centered backgroundColor="white" borderRadius="sm" padding="xs">
                <QRCode size={30} value={activeAccount.address} />
              </Flex>
            ) : (
              <Flex centered>
                <ScanQRIcon color={theme.colors.neutralTextTertiary} height={35} width={35} />
              </Flex>
            )}
            <Flex flexGrow={1} gap="xxs">
              <Text color="neutralTextPrimary" variant="subHead1">
                {currentScreenState === WalletConnectModalState.ScanQr
                  ? t('Show my QR code')
                  : t('Scan a QR code')}
              </Text>
              <Text color="neutralTextSecondary" variant="body2">
                {currentScreenState === WalletConnectModalState.ScanQr
                  ? name
                  : t('Connect to an app with WalletConnect')}
              </Text>
            </Flex>
            <Chevron
              color={theme.colors.neutralTextTertiary}
              direction="e"
              height="20"
              width="15"
            />
          </Flex>
        </Button>
      </Flex>

      <Flex centered mt="md" position="absolute" width="100%">
        <Box bg="neutralOutline" borderRadius="sm" height={4} width={40} />
      </Flex>
    </BottomSheetModal>
  )
}
