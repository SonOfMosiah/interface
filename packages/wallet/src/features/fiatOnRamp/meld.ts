import { NumberType } from 'utilities/src/format/types'
import { FORSupportedCountry } from 'wallet/src/features/fiatOnRamp/types'
import { LocalizationContextState } from 'wallet/src/features/language/LocalizationContext'

export interface MeldLogos {
  darkLogo: string
  lightLogo: string
}

export interface MeldWidgetResponse {
  id: string
  externalSessionId: null | string
  externalCustomerId: null | string
  customerId: string
  widgetUrl: string
  token: string
}

export interface MeldCryptoCurrency {
  address: string
  chainId: string
  cryptoCurrencyChain: string
  cryptoCurrencyCode: string
  displayName: string
  symbol: string
}

export type MeldSupportedToken = {
  crypto: {
    onRamp: {
      cryptoCurrencies: MeldCryptoCurrency[]
      countries: FORSupportedCountry[]
    }
  }
}

export type MeldSupportedTokensResponse = MeldSupportedToken[]

export interface MeldSearchTransactionsResponse {
  transactions: MeldTransaction[]
  count: number
  remaining: number
  totalCount: number
  message: string | null
  error: string | null
}

export interface MeldTransaction {
  key: string
  id: string
  parentPaymentTransactionId: string | null
  accountId: string
  isPassthrough: boolean
  passthroughReference: string | null
  isImported: boolean
  customer: Customer
  paymentMethod: string | null
  transactionType: string
  status:
    | 'PENDING_CREATED'
    | 'PENDING'
    | 'PROCESSING'
    | 'AUTHORIZED'
    | 'AUTHORIZATION_EXPIRED'
    | 'SETTLING'
    | 'SETTLED'
    | 'REFUNDED'
    | 'DECLINED'
    | 'CANCELLED'
    | 'FAILED'
    | 'ERROR'
    | 'VOIDED'
    | 'TWO_FA_REQUIRED'
    | 'TWO_FA_PROVIDED'
  sourceAmount: number
  authAmount: number | null
  captureAmount: number | null
  sourceCurrencyCode: string
  destinationAmount: number
  destinationCurrencyCode: string
  paymentMethodType: string
  serviceProvider: string
  serviceTransactionId: string
  orderId: string | null
  description: string | null
  externalReferenceId: string | null
  serviceProviderDetails: ServiceProviderDetails
  wallet: string
  cryptoPurchaseDetails: CryptoPurchaseDetails
  multiFactorAuthorizationStatus: string | null
  createdAt: string
  updatedAt: string
  countryCode: string
  sessionId: string
  externalSessionId: string | null
  externalCustomerId: string
  sourceAmountInUsd: number
  apiAccessProfileId: string
}

interface Customer {
  id: string
  accountId: string
  externalId: string
  name: {
    firstName: string | null
    lastName: string | null
  }
  addresses: unknown[] // Replace 'any' with a more specific type if you have the structure for addresses
}

interface ServiceProviderDetails {
  feeAmount: number
  serviceProviderCustomerId: string
  cardId: string
  networkFeeAmount: number
  cryptoCurrencyAmount: number
  customerId: string
  extraFeeAmount: number
  cryptoTransactionId: string | null
  type: string
  walletAddress: string
  email: string | null
  cryptoCurrency: string
}

interface CryptoPurchaseDetails {
  destinationCurrencyCode: string
  destinationAmount: number
  walletAddress: string
  networkFee: number
  transactionFee: number
  partnerFee: number | null
  totalFee: number
  blockchainTransactionId: string | null
}

export interface MeldApiError {
  data: {
    code: string
    message: string
    requestId?: string
    timestamp?: string
  }
}

export function getCountryFlagSvgUrl(countryCode: string): string {
  return `https://images-country.meld.io/${countryCode}/flag.svg`
}

export function extractCurrencyAmountFromError(
  errorString: string,
  formatter: LocalizationContextState['formatNumberOrString']
): string | undefined {
  const regex = /(\d+\.\d{2})\s([A-Z]{3})/ // parse string like "50.00 USD"
  const match = errorString.match(regex)
  if (match && match[1] && match[2]) {
    return formatter({
      value: match[1],
      type: NumberType.FiatStandard,
      currencyCode: match[2],
    })
  }
  return
}

export function isMeldApiError(error: unknown): error is MeldApiError {
  return (
    typeof error === 'object' &&
    error != null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data != null &&
    'code' in error.data &&
    'message' in error.data
  )
}
