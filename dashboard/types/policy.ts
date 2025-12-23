import {JsonLdId, JsonLdObject} from "@/types/jsonld";

// export interface Policy {
//     '@id': string;
//     '@type': string;
//     createdAt: string;
//     policy: {
//         'odrl:obligation': any;
//         'odrl:permission': any;
//         'odrl:prohibition': any;
//     };
// }

type Action = "use";

export type PolicyType = "Set" | "Offer" | "Contract";

export interface Constraint {
}

export interface AtomicConstraint extends Constraint {
    leftOperand: string,
    operator: string,
    rightOperand: string
}

export interface MultiplicityConstraint extends Constraint {
    "@type": string;
    constraint: Constraint[];
}

export interface Permission {
    assignee?: string;
    assigner?: string;
    duties?: Duty[];
    target?: string;
    uid?: string;
    constraint?: Constraint[];
    action: Action | string;
}

export interface Duty {
    assignee?: string;
    assigner?: string;
    consequence?: Duty;
    target?: string;
    uid?: string;
    constraint?: Constraint[];
    parentPermission?: Permission;
    action: Action | string;
}

export interface Prohibition {
    assignee?: string;
    assigner?: string;
    target?: string;
    uid?: string;
    constraint?: Constraint[];
    action?: Action | string;
    remedies?: Duty[];
}

export class Policy extends JsonLdId {
    get permissions(): JsonLdObject[] {
        return this.arrayOf(() => new JsonLdObject(), "odrl", "permission");
    }

    get prohibitions(): JsonLdObject[] {
        return this.arrayOf(() => new JsonLdObject(), "odrl", "prohibition");
    }

    get obligations(): JsonLdObject[] {
        return this.arrayOf(() => new JsonLdObject(), "odrl", "obligation");
    }
}

export class PolicyBuilder {
    instance: Policy = new Policy();

    constructor() {
        this.instance[`@context`] = "http://www.w3.org/ns/odrl.jsonld";
    }

    id(id: string): PolicyBuilder {
        this.instance[`@id`] = id;
        return this;
    }

    raw(data: any): PolicyBuilder {
        this.instance = Object.assign(this.instance, data);
        return this;
    }

    type(type: PolicyType): PolicyBuilder {
        this.instance[`@type`] = type;
        return this;
    }

    build(): Policy {
        return this.instance;
    }
}