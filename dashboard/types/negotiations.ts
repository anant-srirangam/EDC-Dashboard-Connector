import {JsonLdId, JsonLdObject} from "@/types/jsonld";

export type NegotiationState =
        | "FINALIZED"
        | "TERMINATED"
        | "REQUESTED"
        | "OFFERED"
        | "ACCEPTED"
        | "AGREED"
        | "VERIFIED";
