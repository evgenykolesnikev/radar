export class RadarGraph {

  constructor(props) {

    this.props = props;
    window.addEventListener(this.props.eventName, this.handleData.bind(this));
    this.started = false;
    this.angle = 1;
    this.trace_set = new Set();

    const saveButton = document.getElementById("saveTracesButton");
    saveButton.addEventListener("click", this.saveTraces.bind(this));
  }

  init(config) {

    this.beamWidth = config.beamWidth;
    this.maxRadius = config.emulationZoneSize;

    this.layout = {
      polar: {
        radialaxis: {
          visible: true,
          ticks: "outside",
          tickmode: "polar",
          range: [0, this.maxRadius],
          tick0: 0,
          dtick: this.maxRadius / 5,
        },
        angularaxis: {
          visible: true,
          ticks: "outside",
          tickmode: "array",
          tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
          ticktext: ["0°","45°", "90°", "135°", "180°", "225°","270°","315°"],
        },
      },
      title: "Radar",
      width: 800,
      height: 600,
      font: {
        size: 10,
      },
      margin: {
        r: 260,
      },
    };

    setInterval(() => {
    
      let adjustRadius = this.maxRadius + this.maxRadius / 2;
      let leftAngle = ( this.angle - this.beamWidth / 2 ) % 360;
      let rightAngle = ( this.angle + this.beamWidth / 2 ) % 360;

      let angleCheck = ( rightAngle - leftAngle + 360) % 360;

      if ( angleCheck =! this.beamWidth) {
        rightAngle++;
      }

      this.detectLine = {
        r: [0, adjustRadius, adjustRadius, 0],
        theta: [leftAngle, leftAngle, rightAngle, rightAngle],
        mode: "lines+markers",
        type: "scatterpolar",
        fill: "toself",
        fillcolor: "grey",
        opacity: 0.4,
        line: { width: 0},
        marker: { size: 1 },
        name: "radar",
      };
      let traces = [...this.trace_set];

      traces.unshift(this.detectLine);

      Plotly.newPlot(this.props.plotId, traces, this.layout);
    }, 20);

    this.started = true;
  }

  handleData(event) {

    if (!this.started) {
      return;
    }

    let scan = event.detail;

    this.angle = scan.scanAngle;

    scan.echoResponses.forEach((response) => {
      this.addPoint(response, scan.scanAngle);
    });

  }

  addPoint(radarResponse, angle) {

    const LIGHT_SPEED = 300000;

    let radius = (LIGHT_SPEED * radarResponse.time) / 2;
    let markerSize = 7;
    let markerType = "circle";

    if (radarResponse.power < 0.3) {
      markerType = "square";
    } else if (radarResponse.power < 0.5) {
      markerType = "diamond";
    } else if (radarResponse.power < 1) {
      markerType = "circle";
    } 

    let trace = {
      r: [radius],
      theta: [angle],
      mode: "markers",
      type: "scatterpolar",
      marker: { size: markerSize, symbol: markerType },
      opacity: 1,
    };

    const currentTime = new Date().toLocaleTimeString();
    trace.name = `${angle}°; ${radius.toFixed(3)} km; ${currentTime}`;

    this.trace_set = new Set();
    this.trace_set.add(trace);

    setTimeout(() => {
      this.erazeTrace(this.trace_set, trace);
    }, 1000);

  }

  erazeTrace(traceSet, trace) {
    traceSet.delete(trace)
  }

  saveTraces() {
    const traceNames = [...this.trace_set].map(trace => trace.name);
    
    const traceData = traceNames.join('\n');

    const outputField = document.getElementById("traceOutput");
    outputField.value = traceData;
  }
}
