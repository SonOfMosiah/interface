import React from 'react'
import { useTranslation } from 'react-i18next'
import { LogoWithTxStatus } from 'src/components/CurrencyLogo/LogoWithTxStatus'
import { AssetType } from 'src/entities/assets'
import { useCurrency } from 'src/features/tokens/useCurrency'
import TransactionSummaryLayout, {
  AssetUpdateLayout,
  TXN_HISTORY_ICON_SIZE,
} from 'src/features/transactions/SummaryCards/TransactionSummaryLayout'
import { BaseTransactionSummaryProps } from 'src/features/transactions/SummaryCards/TransactionSummaryRouter'
import { getTransactionTitle } from 'src/features/transactions/SummaryCards/utils'
import { ApproveTransactionInfo, TransactionType } from 'src/features/transactions/types'
import { shortenAddress } from 'src/utils/addresses'
import { buildCurrencyId } from 'src/utils/currencyId'
import { formatNumberOrString, NumberType } from 'src/utils/format'

export default function ApproveSummaryItem({
  transaction,
  readonly,
  ...rest
}: BaseTransactionSummaryProps & { transaction: { typeInfo: ApproveTransactionInfo } }) {
  const { t } = useTranslation()
  const currency = useCurrency(
    buildCurrencyId(transaction.chainId, transaction.typeInfo.tokenAddress)
  )

  const title = getTransactionTitle(transaction.status, t('Approve'), t('Approved'), t)

  const { approvalAmount } = transaction.typeInfo

  const approvalAmountCaption = approvalAmount === 'INF' ? t('Unlimited') : undefined
  const approvalAmountTitle = `${
    !approvalAmount || approvalAmount === 'INF'
      ? ''
      : formatNumberOrString(transaction.typeInfo.approvalAmount, NumberType.TokenTx)
  } ${currency?.symbol ?? ''}`

  return (
    <TransactionSummaryLayout
      caption={shortenAddress(transaction.typeInfo.spender)}
      endAdornment={
        <AssetUpdateLayout caption={approvalAmountCaption} title={approvalAmountTitle} />
      }
      icon={
        <LogoWithTxStatus
          assetType={AssetType.Currency}
          currency={currency}
          size={TXN_HISTORY_ICON_SIZE}
          txStatus={transaction.status}
          txType={TransactionType.Approve}
        />
      }
      readonly={readonly}
      title={title}
      transaction={transaction}
      {...rest}
    />
  )
}
