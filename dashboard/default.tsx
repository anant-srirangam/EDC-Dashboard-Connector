export const default_edc_management_url =
    process.env.PORT === "13000"
        ? "http://127.0.0.1:19191/api/v1/management" //change to host.docker.internal
        : "http://127.0.0.1:29191/api/v1/management";

export const default_fc_url = "http://localhost:9195/api/catalog/v1alpha/catalog/query";

export const default_edc_api_url =
    process.env.PORT === "13000"
        ? "http://127.0.0.1:18181/api" //change to host.docker.internal
        : "http://127.0.0.1:28181/api";