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
var x = d3.scaleTime()
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

//makes sure that nothing is plotted outside of axes
var clipPath = graph.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", DIM.WIDTH)
    .attr("height", DIM.HEIGHT);

//initialize variables
var state = 1;
var bigmac;

//read in data & first draw
d3.csv("data/big-mac.csv").then(data => {
    data.forEach(d => {
        d.yVal = 0;
    })

    allData = data.map(({ date, name, dollar_price, iso_a3, yVal}) => ({ name, iso: iso_a3, date: new Date(date), price: dollar_price , yVal}));
    
    bigmac = allData.filter(({ iso }) => iso === 'EUZ');

    console.log(bigmac);

    graph.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("clip-path", "url(#clip)"); 


    draw(bigmac, state);
})

//function for drawing a flat line
function flatLine(data) {
    x.domain(d3.extent(data, d => d.date));
    $(".x.axis").addClass("invisible")

    y.domain(d3.extent(data, d => d.yVal));
    $(".y.axis").addClass("invisible")

    line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.yVal))
        .curve(d3.curveBasis);

    graph.select(".line")
        .transition().duration(1000)
        .attr("d", line(data))
}

//function for zooming to data before 2004
function zoomOne(data) {
    var zoomData = data.filter(d => {return d.date < new Date("2004-01-01")});

    updateAxes(zoomData, extent=true);

    line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.price))
        .curve(d3.curveBasis);

    graph.select(".line")
        .transition().duration(1000)
        .attr("d", line(data))
}

//function for zooming to data between 2012 and 2020
function zoomTwo(data) {
    var zoomData = data.filter(d => {return d.date >= new Date("2012-01-01") && d.date < new Date("2020-01-01")});

    updateAxes(zoomData, extent=true);

    line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.price))
        .curve(d3.curveBasis);

    graph.select(".line")
        .transition().duration(1000)
        .attr("d", line(data))
}

//function for zooming out to entire dataset
function zoomOut(data, first=false) {
    $(".x.axis").removeClass("invisible")
    $(".y.axis").removeClass("invisible")
    updateAxes(data, extent=false, fly=first);

    line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.price))
        .curve(d3.curveBasis);

    graph.select(".line")
        .transition().duration(1000)
        .attr("d", line(data))
}

//function to update axes for each new section
function updateAxes(data, extent=false, call=true, fly=false, flat=false) {
    x.domain(d3.extent(data, d => d.date));

    if (flat===true) {
        y.domain([0,0]);
    } else {
        if (extent) {
            y.domain(d3.extent(data, d => d.price));
        } else {
            y.domain([0, d3.max(data, d => d.price)]);
        }
    }
    
    if (call) {
        if (fly) {
            xAxis
                .call(xAxisCall.scale(x))
                .attr("transform", `translate(0, ${DIM.HEIGHT+100})`)
                .transition().duration(1000)
                .attr("transform", `translate(0, ${DIM.HEIGHT})`);

            yAxis
                .call(yAxisCall.scale(y))
                .attr("transform", "translate(-100,0)")
                .transition().duration(1000)
                .attr("transform", "translate(0,0)")
        } else {
            xAxis
                .transition().duration(1000)
                .call(xAxisCall.scale(x))
                .attr("transform", `translate(0, ${DIM.HEIGHT})`);

            yAxis
                .transition().duration(1000)
                .call(yAxisCall.scale(y))
                .attr("transform", "translate(0,0)")
        }
    }
}

//function to call drawing functions depending on the section or state
function draw(data, state) {
    switch (state) {
        case 1:
            flatLine(data);
            break;
        case 2:
            zoomOut(data, first=true);
            break;
        case 3:
            zoomOne(data);
            break;
        case 4:
            zoomOut(data);
            break;
        case 5:
            zoomTwo(data);
            break;
        case 6:
            zoomOut(data);
            break;
    };
};



/*---------- SCROLLMAGIC STUFF ----------*/

//instanciate scrollmagic controller
var controller = new ScrollMagic.Controller();

//get number of steps and length of entire sections div
const n = $("section").length;
const duration = $(".sections").outerHeight(true);

//rounding function
function round( num, precision ) {
    return +(+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
}

//make list with relative endpoints of all steps
var length = [];
for (let i = 1; i <= n; i++) {
    var len = $(".step" + i).outerHeight(true)/duration;

    var sum = 0;
    for (let j = 1; j <= length.length; j++) {
        sum =+ length[j-1];   
    }
    
    length[i-1] = round(len+sum, 3);
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

                    if (!(step === last_step)) {
                        $(".step").removeClass("active")
                        $(".step" + step).addClass("active");
                        draw(bigmac, step);
                    }
                    
                    })