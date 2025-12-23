export type ContractDefinition = {
    '@id': string;
    accessPolicyId: string;
    contractPolicyId: string;
    assetsSelector: AssetSelector[];
}

export type AssetSelector = {
    leftOperand: string;
    operator: string;
    rightOperand: string;
}

export type EdcCriterion = {
    "@type": string;
    "edc:operandLeft": string;
    "edc:operator": string;
    "edc:operandRight": string;
};