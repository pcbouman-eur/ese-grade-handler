// TODO: tolerance options for numeric comparison?

const options = [
    {
        label: '<',
        cmpType: 'column',
        comparison: (v1, v2) => v1 < v2
    },
    {
        label: '≤',
        cmpType: 'column',
        comparison: (v1, v2) => v1 <= v2
    },
    {
        label: '=',
        cmpType: 'column',
        comparison: (v1, v2) => v1 == v2
    },
    {
        label: '≠',
        cmpType: 'column',
        comparison: (v1, v2) => v1 != v2
    },
    {
        label: '≥',
        cmpType: 'column',
        comparison: (v1, v2) => v1 >= v2
    },
    {
        label: '>',
        cmpType: 'column',
        comparison: (v1, v2) => v1 > v2
    },
    {
        label: '<',
        cmpType: 'value',
        comparison: (v1, v2) => v1 < v2
    },
    {
        label: '≤',
        cmpType: 'value',
        comparison: (v1, v2) => v1 <= v2
    },
    {
        label: '=',
        cmpType: 'value',
        comparison: (v1, v2) => v1 == v2
    },
    {
        label: '≠',
        cmpType: 'value',
        comparison: (v1, v2) => v1 != v2
    },
    {
        label: '≥',
        cmpType: 'value',
        comparison: (v1, v2) => v1 >= v2
    },
    {
        label: '>',
        cmpType: 'value',
        comparison: (v1, v2) => v1 > v2
    },
    {
        label: 'is a truthy value',
        cmpType: 'unary',
        comparison: (v) => v
    },
    {
        label: 'is a falsy value',
        cmpType: 'unary',
        comparison: (v) => !v
    }
];

export default options;