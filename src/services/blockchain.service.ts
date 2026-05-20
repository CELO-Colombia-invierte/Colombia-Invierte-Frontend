import * as deployment from './blockchain/deployment';
import * as revenue from './blockchain/revenue';
import * as natillera from './blockchain/natillera';
import * as tokenizacion from './blockchain/tokenizacion';
import * as milestones from './blockchain/milestones';
import * as governance from './blockchain/governance';
import * as disputes from './blockchain/disputes';
import * as reads from './blockchain/reads';
import * as formatting from './blockchain/formatting';

export { decodeContractRevert, decodeContractRevertRaw } from './blockchain/errors';
export type {
  NatilleraConfig,
  NatilleraState,
  NatilleraV2State,
  TokenizacionConfig,
  TokenizacionState,
  RevenueModuleState,
  DeployNatilleraV2Params,
  DeployTokenizacionV2Params,
  V2ContractAddresses,
} from './blockchain/types';
export { FinalizeNotSupportedYet } from './blockchain/types';

export const blockchainService = {
  ...deployment,
  ...revenue,
  ...natillera,
  ...tokenizacion,
  ...milestones,
  ...governance,
  ...disputes,
  ...reads,
  ...formatting,
};
