import type {
  GenerateQrRequest,
  GenerateQrResponse,
} from '../outbound/IMpayGateway.js';

export interface IGenerateQrUseCase {
  execute(req: GenerateQrRequest): Promise<GenerateQrResponse>;
}
