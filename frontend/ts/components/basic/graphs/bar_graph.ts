import Component from '../component';

export type GraphAnswerDescriptor = {
    Value: number;
    Label: string;
    Color: string;
};

export default class BarGraph extends Component {
    protected Canvas: HTMLCanvasElement;
    protected CanvasContext: CanvasRenderingContext2D | null;

    public static readonly DEFAULT_COLOR_SET = [
        '#1f77b4',
        '#ff7f0e',
        '#2ca02c',
        '#d62728',
        '#9467bd',
        '#8c564b',
        '#e377c2',
        '#7f7f7f',
        '#bcbd22',
        '#17becf',
        '#aec7e8',
        '#ffbb78',
        '#98df8a',
        '#ff9896',
        '#c5b0d5',
        '#c49c94',
        '#f7b6d2',
        '#c7c7c7',
        '#dbdb8d',
        '#9edae5'
    ];

    public constructor(width: number = 350, height: number = 200) {
        super();

        this.Element.classList.add('graph');

        this.Canvas = document.createElement('canvas');
        this.AppendChild(this.Canvas);
        this.Canvas.textContent = 'Twoja przeglądarka nie obsługuje wykresów.';
        this.Canvas.width = width;
        this.Canvas.height = height;

        this.CanvasContext = this.Canvas.getContext('2d');
    }

    public Populate(data_points: GraphAnswerDescriptor[]) {
        if(this.CanvasContext === null) return;

        let values: number[] = [];
        let labels: string[] = [];
        let colors: string[] = [];

        for(let data_point of data_points) {
            values.push(data_point.Value);
            labels.push(data_point.Label);
            colors.push(data_point.Color);
        }

        //@ts-ignore - według tsc Chart powinien być dołączony jako moduł
        var myChart = new Chart(this.CanvasContext, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: 'rgba(0,0,0,0.3)',
                    borderWidth: 1
                }]
            },
            options: {
                layout: {
                    padding: 10
                },
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 7,
                            fontColor: '#888'
                        },
                        gridLines: {
                            color: 'rgba(127, 127, 127, 0.5)',
                            zeroLineColor: '#888'
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: '#888'
                        },
                        gridLines: {
                            color: 'rgba(127, 127, 127, 0.5)',
                            zeroLineColor: '#888'
                        }
                    }]
                }
            }
        });
    }
}