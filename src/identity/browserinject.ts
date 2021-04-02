import { BlindingDataLike } from 'liquidjs-lib/types/psbt';
import { MarinaProvider } from 'marina-provider';
import { AddressInterface } from '../types';
import Identity, {
  IdentityInterface,
  IdentityOpts,
  IdentityType,
} from './identity';

/**
 * This interface describes the shape of the value arguments used in contructor.
 * @member windowProvider a valid property of the browser's window object where to lookup the injected provider
 */
export interface InjectOptsValue {
  windowProvider: string;
}

/**
 * A type guard function for InjectOptsValue
 * @see InjectOptsValue
 */
function instanceOfInjectOptsValue(value: any): value is InjectOptsValue {
  return 'windowProvider' in value;
}

export class BrowserInject extends Identity implements IdentityInterface {
  // here we force MarinaProvider since there aren't other Liquid injected API specification available as TypeScript interface yet.
  private provider: MarinaProvider;

  // for inject, is restored always return true (there is only one address to generate)
  readonly isRestored: Promise<boolean> = new Promise(() => true);

  constructor(args: IdentityOpts) {
    super(args);

    // checks the args type.
    if (args.type !== IdentityType.Inject) {
      throw new Error('The identity arguments have not the Inject type.');
    }

    // checks if args.value is an instance of InjectOptsValue interface.
    if (!instanceOfInjectOptsValue(args.value)) {
      throw new Error(
        'The value of IdentityOpts is not valid for Inject Identity.'
      );
    }

    //checks if we are in the brower and if the provider is injected in the dom
    if (
      window === undefined ||
      (window as any)[args.value.windowProvider] === undefined
    ) {
      throw new Error(
        'The value.windowProvider of IdentityOpts is not valid or the script is to injected in the window'
      );
    }

    this.provider = (window as any)[args.value.windowProvider];
  }

  getNextAddress(): AddressInterface | Promise<AddressInterface> {
    return this.provider.getNextAddress();
  }
  getNextChangeAddress(): AddressInterface | Promise<AddressInterface> {
    return this.provider.getNextChangeAddress();
  }
  signPset(psetBase64: string): string | Promise<string> {
    return this.provider.signTransaction(psetBase64);
  }
  getAddresses(): AddressInterface[] | Promise<AddressInterface[]> {
    return this.provider.getAddresses();
  }
  getBlindingPrivateKey(script: string): string {
    throw new Error('Method not implemented.');
  }
  isAbleToSign(): boolean {
    return true;
  }
  blindPset(
    psetBase64: string,
    outputsIndexToBlind: number[],
    outputsPubKeysByIndex?: Map<number, string>,
    inputsBlindingDataLike?: Map<number, BlindingDataLike>
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
