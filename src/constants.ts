const BASE_URL = 'https://dune.com'

export const HEADERS = {
  dnt: '1',
  origin: BASE_URL,
  'sec-ch-ua': 'empty',
  'sec-ch-ua-mobile': '?0',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
}

export const URLS = {
  AUTH: `${BASE_URL}/api/auth`,
  BASE: BASE_URL,
  CSRF: `${BASE_URL}/api/auth/csrf`,
  GRAPH_EXEC_ID: 'https://core-hsr.dune.com/v1/graphql',
  GRAPH_QUERY: 'https://app-api.dune.com/v1/graphql',
  LOGIN: `${BASE_URL}/auth/login`,
  SESSION: `${BASE_URL}/api/auth/session`,
}

export const COOKIES_RGX = /(csrf|auth(-\w+)+)=([\w-.]+)/g

const EXECUTE_QUERY_GQL = `mutation ExecuteQuery($query_id: Int!, $parameters: [Parameter!]!) {
    execute_query_v2(query_id: $query_id, parameters: $parameters) {
        job_id
    }
}`
export const EXECUTE_QUERY_BODY = {
  operationName: 'ExecuteQuery',
  query: EXECUTE_QUERY_GQL,
}

const GET_EXECUTION_GQL =
  'query GetExecution($execution_id: String!, $query_id: Int!, $parameters: [Parameter!]!) {\n  get_execution(\n    execution_id: $execution_id\n    query_id: $query_id\n    parameters: $parameters\n  ) {\n      execution_succeeded {\n        columns\n        data\n      }\n    }\n}\n'
export const QUERY_BODY = {
  operationName: 'ExecuteQuery',
  query: GET_EXECUTION_GQL,
}

export const MAX_AGE = 360 * 60 * 1_000
