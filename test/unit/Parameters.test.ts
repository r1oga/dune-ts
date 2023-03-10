import { Parameters } from 'src/Parameters'
import { ParameterType } from 'src/Parameters/Parameter'

describe('Parameters', () => {
  it('returns an empty array if parameterDatas is undefined', () => {
    expect(Parameters.create()).toEqual([])
  })

  it('create list of object parameters with right types', () => {
    const PARAMETERS_DATA = [
      {
        key: 'amount',
        type: ParameterType.Number,
        value: '100000000000000000000',
      },
      {
        key: 'tokenAddress',
        type: ParameterType.Text,
        value: '"0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"',
      },
      {
        key: 'createdAt',
        type: ParameterType.Datetime,
        value: new Date('3/1/23'),
      },
    ]

    const parameters = Parameters.create(PARAMETERS_DATA)

    PARAMETERS_DATA.slice(0, 2).forEach(({ key, type, value }, index) => {
      expect(parameters[index].key).toEqual(key)
      expect(parameters[index].type).toEqual(type)
    })
    expect(parameters[2].key).toEqual(PARAMETERS_DATA[2].key)
    expect(parameters[2].type).toEqual(PARAMETERS_DATA[2].type)
    expect(parameters[2].value).toEqual('2023-03-01 00:00:00')
  })

  it('throws if constructor with wrong "type" prop value', () => {
    ;[
      ...['foo', 1, null, undefined].map((type) => ({
        key: 'amount',
        type,
        value: '123',
      })),
      'wrong',
      { key: 'amount' },
    ].forEach((data) => {
      expect(() =>
        // @ts-expect-error
        Parameters.create([data]),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Expecting 'type' to be 'datetime', 'number' or 'text (parameter at index 0)"`,
      )
    })
  })
})
