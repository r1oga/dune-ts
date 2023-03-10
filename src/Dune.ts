import { EXECUTE_QUERY_BODY, HEADERS, QUERY_BODY, URLS } from './constants'
import { Cookies } from './Cookies'
import {
  isCookiesPresent,
  isCsrfPresent,
  isTokenPresent,
  maybeLogin,
} from './decorators'
import { ParameterDatas, Parameters } from './Parameters'
import { delay } from './utils'

export class Dune {
  private readonly password: string
  private readonly username: string
  private readonly cookies: Cookies
  private csrf: string | undefined
  private token: string | undefined
  public executionId: string | undefined
  private loggedAt: Date | undefined

  constructor(credentials: { password?: string; username?: string } = {}) {
    let { password, username } = credentials
    password ??= process.env.DUNE_PASSWORD
    username ??= process.env.DUNE_USERNAME

    Object.entries(credentials).forEach(([key, value]) => {
      if (typeof value !== 'string')
        throw new Error(`${key} should be a string`)
      if (value === '') throw new Error(`${key} should be a non empty string`)
    })

    // @ts-expect-error
    this.password = password
    // @ts-expect-error
    this.username = username
    this.cookies = new Cookies()
  }

  private async getCsrfToken() {
    const response = await fetch(URLS.CSRF, { method: 'POST' })

    this.csrf = (await response.json()).csrf
    this.cookies.set(response)
  }

  @isCsrfPresent
  private async getAuthCookies() {
    await fetch(URLS.AUTH, {
      // @ts-expect-error  - decorator already checks if csrf is defined
      body: new URLSearchParams({
        action: 'login',
        csrf: this.csrf,
        next: URLS.BASE,
        password: this.password,
        username: this.username,
      }),
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        cookie: `csrf=${this.csrf}`,
      },
      method: 'POST',
      redirect: 'manual',
    }).then((res) => {
      this.cookies.set(res)
    })
  }

  @isCookiesPresent
  private async getAuthToken() {
    const response = await fetch(URLS.SESSION, {
      body: 'false',
      headers: {
        ...HEADERS,
        cookie: this.cookies.toString(),
      },
      method: 'POST',
    })

    this.token = (await response.json()).token
  }

  public async login() {
    await this.getCsrfToken()
    await this.getAuthCookies()
    await this.getAuthToken()
    this.loggedAt = new Date()
  }

  @isTokenPresent
  private async executeQuery(
    queryId: number,
    parameters: ReturnType<typeof Parameters.create> = [],
  ) {
    const res = await fetch(URLS.GRAPH_EXEC_ID, {
      body: JSON.stringify({
        ...EXECUTE_QUERY_BODY,
        variables: { parameters, query_id: queryId },
      }),
      headers: {
        ...HEADERS,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    this.executionId = (await res.json()).data.execute_query_v2.job_id
  }

  @maybeLogin()
  public async query(queryId: number, parameterDatas?: ParameterDatas) {
    const parameters = Parameters.create(parameterDatas)
    await this.executeQuery(queryId, parameters)

    let executionSucceeded: null | { columns: string[]; data: any[] } = null

    while (executionSucceeded === null) {
      const res = await fetch(URLS.GRAPH_QUERY, {
        body: JSON.stringify({
          ...QUERY_BODY,
          variables: {
            execution_id: this.executionId,
            parameters,
            query_id: queryId,
          },
        }),
        headers: {
          ...HEADERS,
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      executionSucceeded = (await res.json()).data.get_execution
        .execution_succeeded

      await delay(1500)
    }

    const { columns, data } = executionSucceeded
    return { columns, data }
  }
}

export const dune = new Dune()
