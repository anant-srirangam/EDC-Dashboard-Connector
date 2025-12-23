import {JsonLdId, JsonLdObject} from "@/types/jsonld";


export class TransferProcessStatus extends JsonLdId {
    get state(): string {
        return this.mandatoryValue('edc', 'state');
    }
}

export class TransferProcess extends TransferProcessStatus {
    get createdAt(): number {
        return this.mandatoryValue('edc', 'createdAt');
    }
}

export class DataAddress extends JsonLdId {
    get authType(): string {
        return this.mandatoryValue('edc', 'authType');
    }

    get endpoint(): string {
        return this.mandatoryValue('edc', 'endpoint');
    }

    get authorization(): string {
        return this.mandatoryValue('edc', 'authorization');
    }
}