export default function mapEdcOfferToOfferModel(offer: any): any {
    if (Array.isArray(offer)) {
        // recursively handle arrays
        return offer.map(mapEdcOfferToOfferModel);
    }

    if (offer && typeof offer === "object") {
        // recursively handle objects
        return Object.fromEntries(
            Object.entries(offer).map(([key, value]) => {
                const newKey = key.startsWith("odrl:") ? key.replace("odrl:", "") : key;
                const newValue =
                    typeof value === "string"
                        ? value.startsWith("odrl:") ? value.replace("odrl:", "") : value
                        : mapEdcOfferToOfferModel(value);

                return [newKey, newValue];
            })
        );
    }

    if (typeof offer === "string") {
        return offer.startsWith("odrl:") ? offer.replace("odrl:", "") : offer;
    }

    return offer; // numbers, booleans, null
}
