import {JsonLdId, JsonLdObject} from "@/types/jsonld";
import {Policy} from "@/types/policy";
import {NegotiationState} from "@/types/negotiations";

export const enum TransferState {
    NOT_INITIATED = "NOT INITIATED",
    PROCESSING_REQUEST = "PROCESSING",
    INITIATED = "STARTED",
    AWAITING = "AWAITING",
    COMPLETED = "COMPLETED",
    FAILED = "TERMINATED"
}

export class Contract extends JsonLdId {
    get assetId(): string {
        return this.mandatoryValue('edc', 'assetId');
    }

    get providerId(): string {
        return this.mandatoryValue('edc', 'providerId');
    }

    get consumerId(): string {
        return this.mandatoryValue('edc', 'consumerId');
    }

    get signingDate(): number {
        return this.mandatoryValue('edc', 'contractSigningDate');
    }

    get policies(): Policy[] {
        return this.arrayOf(() => new Policy(), "edc", "policy");
    }
}

export class Negotiation extends JsonLdId {
    get type(): string {
        return this.mandatoryValue('edc', 'type');
    }

    get state(): NegotiationState {
        return this.mandatoryValue('edc', 'state');
    }

    get counterPartyId(): string {
        return this.mandatoryValue('edc', 'counterPartyId');
    }

    get counterPartyAddress(): string {
        return this.mandatoryValue('edc', 'counterPartyAddress');
    }

    get initatedOn(): string {
        return this.mandatoryValue('edc', 'createdAt');
    }

    get assetId(): string {
        return this.mandatoryValue('edc', 'assetId');
    }

    get agreementId(): string {
        return this.mandatoryValue('edc', 'contractAgreementId');
    }
}