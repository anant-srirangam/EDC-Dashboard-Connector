import {Permission, Policy, PolicyType} from "@/types/policy";
import {JsonLdId} from "@/types/jsonld";
import {EDC_CONTEXT} from "@/types/context";

export class Provider {
    'endpointUrl': string;
    'id': string;
}

export class ProviderBuilder {
    instance: Provider = new Provider();

    endpoint(url: string): ProviderBuilder {
        this.instance.endpointUrl = url;
        return this;
    }

    id(id: string): ProviderBuilder {
        this.instance.id = id;
        return this;
    }

    build(): Provider {
        return this.instance;
    }
}

export class Catalog extends JsonLdId {
    get participantId(): string {
        return this.mandatoryValue('dspace', 'participantId');
    }

    get datasets(): Dataset[] {
        return this.arrayOf(() => new Dataset(), 'dcat', 'dataset');
    }

    get originator(): string {
        return this.mandatoryValue('edc', 'originator');
    }
}

export class Dataset extends JsonLdId {

    get name(): string {
        return this.mandatoryValue('edc', 'name');
    }

    get description(): string {
        return this.mandatoryValue('edc', 'description');
    }

    get contenttype(): string {
        return this.mandatoryValue('edc', 'contenttype');
    }

    get createdAt(): string {
        return this.mandatoryValue('edc', 'createdAt');
    }

    get version(): string {
        return this.mandatoryValue('edc', 'version');
    }

    get offers(): Offer[] {
        return this.arrayOf(() => new Offer(), 'odrl', 'hasPolicy');
    }
}

export class Offer extends JsonLdId {
}

export class DatasetBuilder {
    instance: Dataset = new Dataset();

    constructor() {
        this.instance[`@context`] = EDC_CONTEXT;
    }

    id(id: string): DatasetBuilder {
        this.instance[`@id`] = id;
        return this;
    }

    raw(data: any): DatasetBuilder {
        this.instance = Object.assign(this.instance, data);
        return this;
    }

    build(): Dataset {
        return this.instance;
    }
}