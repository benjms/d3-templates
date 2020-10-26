/*---------- D3 STUFF ----------*/

//define dimensions
const SIZE = {X:$(".graph").width(), Y:$(".graph").width()*0.6};
const MARGIN = {TOP:10, BOTTOM:100, LEFT:100, RIGHT:10};
const DIM = {WIDTH: SIZE.X - MARGIN.LEFT - MARGIN.RIGHT,
            HEIGHT: SIZE.Y - MARGIN.TOP - MARGIN.BOTTOM};

//add svg to graph class
const svg = d3.select(".graph").append("svg")
    .attr("width", SIZE.X)
    .attr("height", SIZE.Y);

//add group to svg to have margins apply to everything
const graph = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

//define scales
var x = d3.scaleLinear()
    .range([0, DIM.WIDTH]);

var y = d3.scaleLinear()
    .range([DIM.HEIGHT, 0]);

//define axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()

//make axis groups
const xAxis = graph.append("g")
	.attr("class", "x axis")
    .attr("transform", `translate(0, ${DIM.HEIGHT+100})`);
    
const yAxis = graph.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(-50,0)");

//make line generator
line = d3.line()
    .curve(d3.curveCatmullRom)
    .x(d => x(d.miles))
    .y(d => y(d.gas))

//initialize variables
var driving;

function pathLength(path) {
    return d3.create("svg:path").attr("d", path).node().getTotalLength();
}

//read in data & first draw
d3.csv("data/driving.csv").then(data => {
    var i = 0;
    driving = [];

    data.forEach(d => {
        d.year = +d.year;
        d.miles = +d.miles;
        d.gas = +d.gas;
        driving[i] = d;
        i++;
    })

    x.domain(d3.extent(data, d => d.miles));
    xAxis.call(xAxisCall.scale(x))
        .attr("transform", `translate(0, ${DIM.HEIGHT})`);

    y.domain(d3.extent(data, d => d.gas));
    yAxis.call(yAxisCall.scale(y))
        .attr("transform", "translate(0,0)");

    const l_all = pathLength(line(data));

    graph.append("path")
        .attr("class", "line-graph")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .attr("stroke-dasharray", `0,${l_all}`)

    graph.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", d => x(d.miles))
            .attr("cy", d => y(d.gas))
            .attr("r", 3)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
})

console.log(driving);

function makeLine(data, start, end) {
    var startData = data.filter(d => {return (d.year < start)});
    var endData = data.filter(d => {return (d.year < end)});

    const l_all = pathLength(line(data));
    const l_start = pathLength(line(startData));
    const l_end = pathLength(line(endData));

    d3.selectAll("path.line-graph")
        .attr("stroke-dasharray", `${l_start},${l_all-l_start}`)
        .transition().duration((l_end-l_start)*2)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l_end},${l_all-l_end}`);
}

function removeLine(data, start, end) {
    var startData = data.filter(d => {return (d.year < start)});
    var endData = data.filter(d => {return (d.year < end)});

    const l = pathLength(line(data));
    const l_start = pathLength(line(startData));
    const l_end = pathLength(line(endData));

    d3.selectAll("path.line-graph")
        .attr("stroke-dasharray", `${l_start},${l-l_start}`)
        .transition().duration((l_start-l_end)*2)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l_end},${l-l_end}`);
}

function draw(data, step) {
    switch (step) {
        case 1:
            makeLine(data, 1956, 1974);
            break;
        case 2:
            makeLine(data, 1974, 1982);
            break;
        case 3:
            makeLine(data, 1982, 1987);
            break;
        case 4:
            makeLine(data, 1987, 2000);
            break;
        case 5:
            makeLine(data, 2000, 2009);
            break;
        case 6:
            makeLine(data, 2009, 2011);
            break;
    };
}

function reverseDraw(data, step) {
    switch (step) {
        case 1: 
            removeLine(data, 1982, 1974);
            break;
        case 2:
            removeLine(data, 1987, 1982);
            break;
        case 3:
            removeLine(data, 2000, 1987);
            break;
        case 4:
            removeLine(data, 2009, 2000);
            break;
        case 5:
            removeLine(data, 2011, 2009);
            break;
    }
}


/*---------- SCROLLMAGIC STUFF ----------*/

//instanciate scrollmagic controller
var controller = new ScrollMagic.Controller();

//get number of steps and length of entire sections div
const n = $("section").length;
const duration = $(".sections").outerHeight(true);

//make list with relative endpoints of all steps
var length = [];
for (let i = 1; i <= n; i++) {
    var len = $(".step" + i).outerHeight(true)/duration;

    var sum = 0;
    for (let j = 1; j <= length.length; j++) {
        sum =+ length[j-1];   
    }
    
    length[i-1] = len+sum;
}

//initialize last_step
var last_step = 0;

//define scrollmagic scene to be triggered by sections class and measure at 25% from the top
var scene = new ScrollMagic.Scene({triggerHook: 0.25, triggerElement: ".sections", offset: 0, duration: duration})
                .addTo(controller)
                .on("progress", function (e) {
                    //define progress as how far we've scrolled (0 to 1)
                    var progress = e.progress.toFixed(3);
                    
                    //use progess and relative endpoints to determine in which section we are
                    var step;
                    if (progress < length[0]) {
                        step = 1;
                    } else if (progress < length[1]) {
                        step = 2;
                    } else if (progress < length[2]) {
                        step = 3;
                    } else if (progress < length[3]) {
                        step = 4;
                    } else if (progress < length[4]) {
                        step = 5;
                    } else if (progress < length[5]) {
                        step = 6;
                    }

                    if (step > last_step) {
                        $(".step").removeClass("active");
                        $(".step" + step).addClass("active");
                        draw(driving, step);
                        last_step = step;
                    };

                    if (step < last_step) {
                        $(".step").removeClass("active");
                        $(".step" + step).addClass("active");
                        reverseDraw(driving, step);
                        last_step = step;
                    };
                });