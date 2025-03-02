import { atomWithStorage, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { ReactNode, createContext, useCallback, useContext } from 'react'
import { useGate } from 'statsig-react'

/**
 * The value here must match the value in the statsig dashboard, if you plan to use statsig.
 */
export enum FeatureFlag {
  traceJsonRpc = 'traceJsonRpc',
  fallbackProvider = 'fallback_provider',
  uniswapXSyntheticQuote = 'uniswapx_synthetic_quote',
  multichainUX = 'multichain_ux',
  currencyConversion = 'currency_conversion',
  infoExplore = 'info_explore',
  infoTDP = 'info_tdp',
  infoPoolPage = 'info_pool_page',
  infoLiveViews = 'info_live_views',
  quickRouteMainnet = 'enable_quick_route_mainnet',
  progressIndicatorV2 = 'progress_indicator_v2',
  feesEnabled = 'fees_enabled',
  limitsEnabled = 'limits_enabled',
  eip6963Enabled = 'eip6963_enabled',
  gatewayDNSUpdate = 'gateway_dns_update',
  sendEnabled = 'swap_send',
  gatewayDNSUpdateAll = 'gateway_dns_update_all',
  landingPageV2 = 'landing_page_v2',
  limitsFees = 'limits_fees',
  exitAnimation = 'exit_animation',
}

interface FeatureFlagsContextType {
  isLoaded: boolean
  flags: Record<string, string>
  configs: Record<string, any>
}

const FeatureFlagContext = createContext<FeatureFlagsContextType>({ isLoaded: false, flags: {}, configs: {} })

export function useFeatureFlagsContext(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw Error('Feature flag hooks can only be used by children of FeatureFlagProvider.')
  } else {
    return context
  }
}

/* update and save feature flag & dynamic config settings */
export const featureFlagSettings = atomWithStorage<Record<string, string>>('featureFlags', {})
export const dynamicConfigSettings = atomWithStorage<Record<string, any>>('dynamicConfigs', {})

export function useUpdateFlag() {
  const setFeatureFlags = useUpdateAtom(featureFlagSettings)

  return useCallback(
    (featureFlag: string, option: string) => {
      setFeatureFlags((featureFlags) => ({
        ...featureFlags,
        [featureFlag]: option,
      }))
    },
    [setFeatureFlags]
  )
}

export function useUpdateConfig() {
  const setConfigs = useUpdateAtom(dynamicConfigSettings)

  return useCallback(
    (configName: string, option: any) => {
      setConfigs((configs) => ({
        ...configs,
        [configName]: option,
      }))
    },
    [setConfigs]
  )
}

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  // TODO: `isLoaded` to `true` so `App.tsx` will render. Later, this will be dependent on
  // flags loading from Amplitude, with a timeout.
  const featureFlags = useAtomValue(featureFlagSettings)
  const dynamicConfigs = useAtomValue(dynamicConfigSettings)
  const value = {
    isLoaded: true,
    flags: featureFlags,
    configs: dynamicConfigs,
  }
  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>
}

export function useFeatureFlagsIsLoaded(): boolean {
  return useFeatureFlagsContext().isLoaded
}

export enum BaseVariant {
  Control = 'control',
  Enabled = 'enabled',
}

export function useBaseFlag(flag: string, defaultValue = BaseVariant.Control): BaseVariant {
  const { value: statsigValue } = useGate(flag) // non-existent gates return false
  const featureFlagsContext = useFeatureFlagsContext()
  if (statsigValue) {
    return BaseVariant.Enabled
  }
  switch (featureFlagsContext.flags[flag]) {
    case 'enabled':
      return BaseVariant.Enabled
    case 'control':
      return BaseVariant.Control
    default:
      return defaultValue
  }
}
