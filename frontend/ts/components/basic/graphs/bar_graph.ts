import Component from '../component';

export type GraphAnswerDescriptor = {
    Value: number;
    Label: string;
    Color: string;
};

export default class BarGraph extends Component {
    protected Canvas: HTMLCanvasElement;
    protected CanvasContext: CanvasRenderingContext2D | null;

    protected readonly WIDTH = 350;
    protected readonly HEIGHT = 200;

    public constructor() {
        super();

        this.Element.classList.add('graph');

        this.Canvas = document.createElement('canvas');
        this.AppendChild(this.Canvas);
        this.Canvas.textContent = 'Twoja przeglądarka nie obsługuje wykresów.';
        this.Canvas.width = this.WIDTH;
        this.Canvas.height = this.HEIGHT;

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

        //@ts-ignore
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