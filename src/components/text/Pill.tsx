import React, { ReactNode } from 'react'
import { Flex, FlexProps } from 'src/components/layout'
import { Text } from 'src/components/Text'

type PillProps = {
  customBackgroundColor?: string
  customBorderColor?: string
  foregroundColor?: string
  icon?: ReactNode
  label: string
} & FlexProps

export function Pill({
  customBackgroundColor,
  customBorderColor,
  borderRadius = 'full',
  foregroundColor,
  flexDirection = 'row',
  icon,
  label,
  px = 'md',
  py = 'xs',
  ...rest
}: PillProps) {
  return (
    <Flex
      backgroundColor="gray200"
      borderColor="none"
      borderRadius={borderRadius}
      borderWidth={1}
      flexDirection={flexDirection}
      px={px}
      py={py}
      style={{
        ...(customBackgroundColor ? { backgroundColor: customBackgroundColor } : {}),
        ...(customBorderColor ? { borderColor: customBorderColor } : {}),
      }}
      gap="xs"
      justifyContent="center"
      alignItems="center"
      {...rest}>
      {icon}
      <Text variant="body" color="black" style={{ color: foregroundColor }}>
        {label}
      </Text>
    </Flex>
  )
}
