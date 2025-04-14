// Type definitions for SVG components
declare module '@/lib/svgs' {
  import { FC } from 'react';

  // Define interface for components that accept className
  interface IconProps {
    className?: string;
  }

  export const WalletLoader: FC;
  export const NetworkIcon: FC;
  export const BalanceIcon: FC;
  export const ErrorIcon: FC;
  export const CloseIcon: FC;
  export const SendIcon: FC;
  export const InfoIcon: FC;
  export const CheckShieldIcon: FC;
  export const RefreshIcon: FC;
  export const LightningIcon: FC;
  export const WarningIcon: FC<IconProps>;
  export const ExternalLinkIcon: FC;
  export const WalletAddressIcon: FC;
  export const CopyIcon: FC;
  export const WalletIcon: FC;
  export const NetworkCardIcon: FC;
  export const LoginIcon: FC;
  export const ContractIcon: FC;
  export const OpenSeaIcon: FC;
  export const EtherscanIcon: FC;
  export const MiningIcon: FC;
  export const PitIcon: FC;
}

